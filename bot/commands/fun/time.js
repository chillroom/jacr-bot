const request = require("request");

module.exports = (bot, data) => {
    const user = data.user.username;
    if (typeof(data.params) !== "undefined" && data.params.length > 0) {
        if (data.params.length === 1 && data.params[0] === ("help" || "h")) {
            bot.sendChat(bot.identifier + "you can check the time of any town, city anywhere in the world by doing: !time [in | is it in | for] [location]. You may want to be specific with locations like: \"London, Canada\" for best results");
        } else {
            var text = data.params.join(" ");
            if (/(in|is it in|for) (.*)/i.test(text)) {
                var api_key = "***REMOVED***";
                var query = data.message.match(/(in|is it in|for) (.*)/i)[2];
                query = query.split(" ");
                query = query.join("+");
                request("http://api.worldweatheronline.com/free/v2/weather.ashx?key=" + api_key + "&q=" + query + "&format=json&showlocaltime=yes", (error, response, body) => {
                    body = JSON.parse(body);
                    if (typeof(body.data.error) === "undefined") {
                        var location = body.data.request[0].query;
                        var currentTime = body.data.time_zone[0].localtime.slice(11);
                        bot.sendChat(bot.identifier + "@" + user + " current time in " + location + " is " + currentTime);
                    } else {
                        bot.sendChat(bot.identifier + "@" + user + " sorry, no location found");
                    }
                });
            }
        }
    }
};
