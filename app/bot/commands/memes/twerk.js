module.exports = function(bot) {
    var twerks = [
        "https://bot.plugable.info/image/56956537033937cabf8eef7a.gif"
    ];
    var twerk = twerks[Math.floor(Math.random() * twerks.length)];
    bot.sendChat(twerk);
};