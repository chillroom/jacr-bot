var request = require("request");

module.exports = function (bot, data) {
    var user = data.user.username;
    if (user === "nitroghost") {
        if (typeof(data.params) !== "undefined" && data.params.length > 0) {
            if (data.params[0] === "cmd" || data.params[0] === "command") {
                var cmd = data.params[1];
                var type = data.params[2];
                data.params.splice(0, 3);
                var response = data.params.join(" ");
                request.post({
                    url: "https://api.plugable.info/api/commands/add",
                    form: {
                        name: cmd,
                        type: type,
                        response: response
                    }
                }, function (err, resp, body) {
                    if (err) {
                        bot.sendChat(bot.identifier + "Something went wrong");
                    } else {
                        body = JSON.parse(body);
                        bot.sendChat(bot.identifier + body.message);
                    }
                });
            }
        }
    }
};
