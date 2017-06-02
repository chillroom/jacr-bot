const request = require("request");
const config = require('../../config');

module.exports = (bot, data) => {
    const user = data.user.username;
    if (typeof(data.params) !== "undefined" && data.params.length > 0) {
    } else {
        bot.sendChat("You can check the time of any town, city anywhere in the world by doing: !time [location]. Example: !time \"England, USA\".");
        return
    }

    var text = data.params.join(" ");
    
    var api_key = config.weather_api_key;
    request("http://api.worldweatheronline.com/free/v2/weather.ashx?key=" + api_key + "&q=" + text.replace(" ", "+") + "&format=json&showlocaltime=yes", (error, response, body) => {
        body = JSON.parse(body);
        if (typeof(body.data.error) === "undefined") {
            var location = body.data.request[0].query;
            var currentTime = body.data.time_zone[0].localtime.slice(11);
            bot.sendChat("@" + user + " current time in " + location + " is " + currentTime);
        } else {
            bot.sendChat("@" + user + " sorry, no location found");
        }
    });
    

};
