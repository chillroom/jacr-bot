const request = require("request");

module.exports = (bot, data) => {
    const user = data.user.username;
    if (data.params != null && data.params.length > 0) {
    } else {
        bot.sendChat(bot.identifier + "@" + user + " you forgot to ask a word/phrase to define");
        return
    }
        
    var term = data.params.join(" ");

    request("http://api.urbandictionary.com/v0/define?term=" + encodeURIComponent(term), (error, response, body) => {
        if (error) {
            bot.log("error", "BOT", error);
            bot.sendChat(bot.identifier + "something went wrong with the urban dictionary API");
            return
        } 

        body = JSON.parse(body);
        if (body.result_type === "no_results") {
            bot.sendChat(bot.identifier + "could not find the definition for: " + term);
            return 
        }

        var definition = body.list[0].definition;
        bot.sendChat(bot.identifier + "http://urbandictionary.com/define.php?term=" + encodeURIComponent(term));

        var slicer = 255 - (term.length + " definition: ".length);
        if (definition.length <= (510 - slicer)) {
            bot.sendChat(bot.identifier + term + " definition: " + definition);
        } else {
            bot.sendChat(bot.identifier + " sorry the definition for " + term + " is too long to be shown");
        }
    });

};
