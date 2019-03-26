const TwitchBot = require('twitch-bot');

class Trivia {
    live = false;
    askLoop = null;
    answer = null;

    constructor(config, questions) {
        this.bot = new TwitchBot({
            username: config.twitchUsername,
            oauth: config.twitchOauth,
            channels: config.channels,
        });

        this.questions = questions;
        this.secondsPerQuestion = config.secondsPerQuestion;
        this.commands = config.commands;
    }

    handleMessage(message) {
        if (this.handleCommand(message)) {
            return true;
        }

        // attempt answer
    }

    say(message) {
        this.bot.say(`/me ${message}`);
        return true;
    }

    start = () => {
        this.live = true;

        this.ask();

        this.askLoop = setInterval(() => {
            this.ask();
        }, (this.secondsPerQuestion - 10) * 1000);
    };

    stop = () => {
        this.live = false;
        this.answer = null;

        clearInterval(this.askLoop);

        this.say('riPepperonis RIP riPepperonis');
    };

    ask = (question = this.getRandomQuestion()) => {
        if (this.answer) {

        }


    };

    getRandomQuestion = (questions = this.questions) => {
        return questions[Math.floor(Math.random() * questions.length)];
    };

    handleCommand = command => {
        if (!this.isUnfommattedCommand(command)) {
            return false;
        }

        command = this.formatCommand(command);

        if (!this.isValidCommand(command)) {
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

    doesCommandExists = command => {
        return this.commands.hasOwnProperty(command.name)
            && this.commands[command.name].includes(command.action);
    };

    executeCommand = command => {
        // execute
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
}
