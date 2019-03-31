module.exports = class User {
    constructor(user) {
        this.username = user.username;
        this.displayName = user.display_name;
        this.isStreamer = user.badges.hasOwnProperty('broadcaster') && user.badges.broadcaster === 1;
        this.isMod = user.mod || this.isStreamer;
        this.isSub = user.subscriber;
        this.isTurbo = user.turbo;
        this.isPleb = !this.isMod && !this.isSub && !this.isStreamer;
    }
};
