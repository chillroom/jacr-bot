module.exports = function(bot) {
    bot.on("user-join", function(data) {
        if (data.user.id === bot._.self.id) {
            bot.log("eror", "BOT", "Bot left the room");
        }
    });
};