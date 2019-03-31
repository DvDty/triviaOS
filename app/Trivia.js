const TwitchBot = require('twitch-bot');

class Trivia {
    live = false;
    askLoop = null;
    answer = '';

    constructor(config, questions) {
        this.config = config;

        this.bot = new TwitchBot({
            username: this.getConfig('twitchUsername'),
            oauth: this.getConfig('twitchOauth'),
            channels: this.getConfig('channels'),
        });

        this.questions = questions;
        this.secondsPerQuestion = this.getConfig('secondsPerQuestion');
        this.commands = this.getConfig('commands');
        this.streak = {username: '', points: 0};
    }

    getConfig(key) {
        if (!this.config.hasOwnProperty(key) || !this.config.key) {
            throw `${key} key is missing from your config file or its value is invalid.`;
        }

        return this.config.key;
    };

    handleMessage(message, user) {
        if (typeof message !== 'string') {
            return false;
        }

        if (this.isUnfommattedCommand(message)) {
            return this.handleCommand(message, user);
        }

        if (this.live) {
            return this.attemptAnswer(message, user);
        }

        return false;
    }

    say(message) {
        this.bot.say(`/me ${message}`);
        return true;
    }

    start = () => {
        this.live = true;

        this.ask().then();

        this.askLoop = setInterval(() => {
            this.ask().then().catch(e => {
                console.log(e);
            });
        }, (this.secondsPerQuestion - 10) * 1000);
    };

    stop = () => {
        this.live = false;
        this.answer = null;

        clearInterval(this.askLoop);

        this.say('riPepperonis RIP riPepperonis');
    };

    ask = async(question = this.getRandomQuestion()) => {
        if (this.answer) {
            this.say('Nobody answered correctly. The answer was ' + this.answer);
            this.answer = null;
            await this.sleep(5);
        }

        this.say('Next question in 10 seconds...');
        await this.sleep(10);

        this.say(question.question);
        this.answer = question.answer;
    };

    attemptAnswer = (message, user) => {
        if (!this.answer || message.toLowerCase() !== this.answer.toLowerCase()) {
            return false;
        }

        let answer = this.answer;
        this.answer = null;

        let points = 0; // todo: retrieve from db
        let add = 1;

        if (!this.isPleb(user)) {
            add += this.getConfig('subBonus');
        }

        if (this.streak.username === user.username) {
            this.streak.points++;
        } else {
            this.streak.username = user.username;
            this.streak.points = 1;
        }

        this.say(`
            ${user.displayName} got it PogChamp !
            The answer was ${this.answer}. +${add} points = ${points + add} total.
            Streak ${this.streak.points}.
        `);

        // todo: update user's points in db
    };

    getRandomQuestion = (questions = this.questions) => {
        return questions[Math.floor(Math.random() * questions.length)];
    };

    handleCommand = (command, user) => {
        if (!this.isUnfommattedCommand(command)) {
            return false;
        }

        command = this.formatCommand(command);

        if (!this.isValidCommand(command)) {
            return false;
        }

        if (!this.userHaveAccess(command, user)) {
            return false;
        }

        this.executeCommand(command);
    };

    isUnfommattedCommand = message => message.charAt(0) === '!';

    formatCommand = command => {
        command = command.split(' ');

        return {
            name: command.shift().substr(1),
            action: command.shift(),
        };
    };

    isValidCommand = command => {
        if (typeof command === 'object'
            && typeof command.name === 'string'
            && typeof command.action === 'string'
        ) {
            return this.doesCommandExists(command);
        }

        return false;
    };

    userHaveAccess = (command, user) => {
        return true; // todo
    };

    doesCommandExists = command => {
        return this.commands.hasOwnProperty(command.name)
            && this.commands[command.name].includes(command.action);
    };

    executeCommand = command => {
        this.commands[command.name](command.action);
    };

    trivia = action => {
        if (action === 'on') {
            if (this.live) {
                return this.say('is already running');
            }

            this.start();
        }

        if (action === 'off') {
            if (!this.live) {
                return this.say('is already off');
            }

            this.stop();
        }
    };

    sleep = seconds => new Promise(res => setTimeout(res, seconds));

    isPleb(user) {
        return this.isMod(user); //todo: add sub and broadcaster check
    }

    isMod(user) {
        return user.mod;
    };
}
