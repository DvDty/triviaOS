class Command {
    commands = {
        'trivia': [
            'on', 'off',
        ],
    };

    handleCommand(command) {
        if (!this.isCommand(command)) {
            return false;
        }

        command = this.formatCommand(command);
    }

    isCommand = message => message.charAt(0) === '!';

    formatCommand = command => {
        command = command.split(' ');

        return {
            name: command.shift().substr(1),
            action: command.shift(),
        };
    };
}