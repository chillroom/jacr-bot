module.exports = (bot) => {
    bot.on("user-join", (data) => {
        if (data.user.id === bot._.self.id) {
            bot.log("error", "BOT", "Bot left the room");
        }
    });
};
