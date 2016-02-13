module.exports = function(bot) {
    bot.sendChat(bot.identifier + "Requesting a command:  https://bitbucket.org/dubbot/betabot/issues?status=new&status=open");
};

module.exports.extra = ["request", "requests", "suggestion"];
