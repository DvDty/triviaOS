const User = require('../app/User');
const Command = require('../app/Command');
const Config = require('../app/Config');
const Bot = require('twitch-bot');

module.exports = class Trivia {

    constructor() {
        this.live = false;
        this.askLoop = null;
        this.answer = '';

        this.config = new Config();
        this.bot = new Bot(this.config.get('botCredentials'));
        this.command = new Command(this);

        this.questions = require('../questions');

        this.streak = {username: '', points: 0};
    }

    listen() {
        this.bot.on('join', () => {
            this.bot.on('message', user => {
                this.handleMessage(user.message, user);
            });
        });
    }

    handleMessage(message, user) {
        if (!this.live || typeof message !== 'string') {
            return false;
        }

        user = new User(user);

        if (message.slice(0, 1) === '!') {
            return this.command.handle(message, user);
        }

        return this.attemptAnswer(message, user);
    }

    say(message) {
        this.bot.say(`/me ${message}`);
    }

    start() {
        this.live = true;

        this.say('HeyGuys Let\'s get started!');
        this.ask();

        this.askLoop = setInterval(() => {
            this.ask();
        }, (this.config.get('secondsPerQuestion') - 10) * 1000);
    };

    stop() {
        this.live = false;
        this.answer = '';

        clearInterval(this.askLoop);

        this.say('riPepperonis RIP riPepperonis');
    };


    // todo: move ask, attemptAnswer and getQuestion to Question class
    ask(question = this.getRandomQuestion()) {
        if (this.answer) {
            this.say('Nobody answered correctly. The answer was ' + this.answer);
            this.answer = null;
            this.streak.points = 0;

            setTimeout(_ => {
                this.ask(question);
            }, 3000);

            return false;
        }

        this.say('Next question in 10 seconds...');

        setTimeout(_ => {
            this.say(question.question);
            this.answer = question.answer;
        }, 10000);
    };

    attemptAnswer(message, user) {
        if (this.answer === '' || message.toLowerCase() !== this.answer.toLowerCase()) {
            return false;
        }

        let answer = this.answer;
        this.answer = '';

        let points = 0; // todo: retrieve from db
        let add = 1;

        if (!user.isPleb) {
            add += this.config.get('subBonus');
        }

        if (this.streak.username === user.username) {
            this.streak.points++;
            // check for max streak
        } else {
            this.streak.username = user.username;
            this.streak.points = 1;
        }

        this.say(`Congratulations ${user.displayName}! The answer was ${answer}. Points [${points} + ${add}]. Streak ${this.streak.points}.`);

        // todo: update user's points in db
    };

    getRandomQuestion(questions = this.questions) {
        return questions[Math.floor(Math.random() * questions.length)];
    };
};
