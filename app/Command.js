const Trivia = require('../app/Trivia');

module.exports = class Command {
    constructor(trivia) {
        this.triviaInstance = trivia;
        this.commands = this.triviaInstance.config.get('commands');
    }

    handle(unfommattedCommand, user) {
        let command = this.get(unfommattedCommand);
        let parameters = unfommattedCommand.split(' ').slice(1);

        if (!command || !this.userHasAccess(command, user)) {
            return false;
        }

        this.execute(command, parameters);
    };

    get(unfommattedCommand) {
        let name = unfommattedCommand.split(' ').shift().substr(1);
        return this.commands.filter(command => {
            return command.name === name;
        })[0];
    };

    userHasAccess(command, user) {
        return command.access.every(requirement => {
            return user[requirement];
        });
    };

    execute(command, parameters) {
        this[command.name](...parameters);
    };

    // The functions below are predefined in config file
    // and are dynamically executed
    trivia(action) {
        if (action === 'on') {
            if (this.triviaInstance.live) {
                return this.triviaInstance.say('is already running.');
            }

            this.triviaInstance.start();
        }

        if (action === 'off') {
            if (!this.triviaInstance.live) {
                return this.triviaInstance.say('is already off.');
            }

            this.triviaInstance.stop();
        }
    };
};
