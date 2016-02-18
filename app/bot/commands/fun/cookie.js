module.exports = (bot, data) => {
    var cookies = [
        "a chocolate chip cookie!",
        "a soft homemade oatmeal cookie!",
        "a plain, dry, old cookie. It was the last one in the bag. Gross.",
        "a sugar cookie. What, no frosting and sprinkles? 0/10 would not touch.",
        "a chocolate chip cookie. Oh wait, those are raisins. Bleck!",
        "an enormous cookie. Poking it gives you more cookies. Weird.",
        "a fortune cookie. It reads \"Why aren't you working on any projects?\"",
        "a fortune cookie. It reads \"Give that special someone a compliment\"",
        "a fortune cookie. It reads \"Take a risk!\"",
        "a fortune cookie. It reads \"Go outside.\"",
        "a fortune cookie. It reads \"Don't forget to eat your veggies!\"",
        "a fortune cookie. It reads \"Do you even lift?\"",
        "a fortune cookie. It reads \"m808 pls\"",
        "a fortune cookie. It reads \"If you move your hips, you'll get all the ladies.\"",
        "a fortune cookie. It reads \"I love you.\"",
        "a Golden Cookie. You can't eat it because it is made of gold. Dammit.",
        "an Oreo cookie with a glass of milk!",
        "a rainbow cookie made with love :heart:",
        "an old cookie that was left out in the rain, it's moldy.",
        "freshly baked cookies, they smell amazing."
    ];
    const cookie = cookies[Math.floor(Math.random() * cookies.length)];
    const user = data.user.username;
    if (typeof(data.params) !== "undefined" && data.params.length > 0) {
        if (data.params.length === 1) {
            if (data.params[0].substr(0, 1) === "@") {
                var recipient = data.params[0];
                bot.sendChat(bot.identifier + "@" + user + " just sent " + recipient + " " + cookie);
            } else {
                bot.sendChat(bot.identifier + "@" + user + " you need to @[username] to send them a cookie");
            }
        } else {
            bot.sendChat(bot.identifier + "@" + user + " you can only send a cookie to one person");
        }
    } else {
        bot.sendChat(bot.identifier + "@" + user + " you didn't select a user. You need to @[username] to send them a cookie");
    }
};
