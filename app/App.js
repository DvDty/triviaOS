class App {
    constructor() {
        this.trivia = new Trivia();
        this.question = new Question();
        this.command = new Command();
    }

    handleMessage(message) {
        this.command.isCommand(message)
            ? this.command.handleCommand(message)
            : this.question.attemptAnswer(message);
    }
}
