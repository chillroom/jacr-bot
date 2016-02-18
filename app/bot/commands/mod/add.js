var request = require("request");

module.exports = (bot, data) => {
    const user = data.user.username;
    if (user === "nitroghost") {
        if (typeof(data.params) !== "undefined" && data.params.length > 0) {
            if (data.params[0] === "cmd" || data.params[0] === "command") {
                const cmd = data.params[1];
                const type = data.params[2];
                data.params.splice(0, 3);
                const response = data.params.join(" ");
                request.post({
                    url: "https://api.plugable.info/api/commands/add",
                    form: {
                        name: cmd,
                        type: type,
                        response: response
                    }
                }, (err, resp, body) => {
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
