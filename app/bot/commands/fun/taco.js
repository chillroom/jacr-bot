module.exports = function(bot, data) {
    var tacos = [
        "a spicy taco!",
        "a taco filled with questionable meat, I wouldn't touch that.!",
        "a scrumptious taco full of " +
        "meaty goodness, mmmm",
        "a taco full of rainbows and love!"
    ];
    var taco = tacos[Math.floor(Math.random() * tacos.length)];
    var user = data.user.username;
    if (typeof(data.params) !== "undefined" && data.params.length > 0) {
        if (data.params.length === 1) {
            if (data.params[0].substr(0, 1) === "@") {
                var recipient = data.params[0];
                bot.sendChat(bot.identifier + "@" + user + " just sent " + recipient + " " + taco);
            } else {
                bot.sendChat(bot.identifier + "@" + user + " you need to @[username] to send them a taco");
            }
        } else {
            bot.sendChat(bot.identifier + "@" + user + " you can only send a taco to one person");
        }
    } else {
        bot.sendChat(bot.identifier + "@" + user + " you didn't select a user. You need to @[username] to send them a taco");
    }
};