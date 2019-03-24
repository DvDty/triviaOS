const TwitchBot = require('twitch-bot');

let questions = require('./questions');
let config = require('./config');

let trivia = false;
let answer = null;
let streak = {user: null, consecutive: 0};
let highScore = {user: null, score: 0};
let autoDie = 0;
let interval;

const Bot = new TwitchBot({
    username: 'triviaos',
    oauth: config.twitchOauth,
    channels: config.channels,
});

Bot.on('join', () => {
    Bot.on('message', chatter => {

        if (chatter.message === '!trivia on' && isMod(chatter) && !trivia) {
            Bot.say(`/me HeyGuys Let's get started PogChamp . Loading ${questions.length} questions!`);

            trivia = true;

            ask();
            interval = setInterval(function() {
                if (trivia) {
                    ask();
                }
            }, 50 * 1000);
        }

        if (trivia && typeof answer === 'string' && chatter.message.toLowerCase() === answer.toLowerCase()) {
            if (streak.user === chatter.username) {
                streak.consecutive++;
            } else {
                streak.user = chatter.username;
                streak.consecutive = 1;
            }

            Bot.say(`Correct, ${chatter.username}. The answer was: ${answer}. Streak: ${streak.consecutive}`);

            answer = null;

            if (streak.consecutive > highScore.score) {
                highScore.user = streak.user;
                highScore.score = streak.consecutive;
                Bot.say(`NEW STREAK HIGH SCORE POGGERS ${highScore.score} by ${highScore.user}`);
            }

            autoDie = 0;
        }

        if (chatter.message === '!trivia off' && isMod(chatter) && trivia) {
            off(interval);
        }
    });
});

Bot.on('error', err => {
    console.log(err);
});

function isMod(chatter) {
    return chatter.mod || chatter.username === config.channels[0];
}

function ask(timeout = 10) {
    let message = '';

    if (answer) {
        answer = null;
        message = `No one got it correctly BibleThump The answer was ${answer}. `;
        streak = {user: null, consecutive: 0};
        autoDie++;

        if (autoDie === 5) {
            Bot.say(`/me Seems like I'm alone here.`);
            off(interval);
            return false;
        }
    }

    message += `Next question in ${timeout} seconds...`;

    Bot.say(message);

    let question = getRandomQuestion();

    setTimeout(function() {
        Bot.say(`/me ${question.question}`);
        answer = question.answer;
    }, timeout * 1000);
}

function getRandomQuestion() {
    return questions[Math.floor(Math.random() * questions.length)];
}

function off(interval) {
    trivia = false;
    clearInterval(interval);
    Bot.say(`/me :zzz: Good bye.`);
}
