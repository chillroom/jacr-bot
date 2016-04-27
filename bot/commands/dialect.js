const request = require("request");
const Select = require("soupselect").select;
const HtmlParser = require("htmlparser");

module.exports = (bot, data) => {
    var dialects = ["redneck", "jive", "cockney", "fudd", "bork", "moron", "piglatin", "hckr", "censor"];
    if (typeof(data.params) !== "undefined" && data.params.length > 0) {
        if (data.params.length === 1) {
            if (data.params[0] === ("help" || "h")) {
                bot.sendChat(bot.identifier + "dialects: " + dialects.join(", "));
            } else {
                bot.sendChat(bot.identifier + "to use do: !dialect [dialect] [message]");
            }
        } else {
            if (data.params[0] === ("hacker" || "hax" || "haxor")) {
                data.params[0] = "hckr";
            }
            if (dialects.indexOf(data.params[0]) > -1) {
                var dialect = data.params[0];
                var text = data.params.slice(1).join(" ").trim();
                request("http://www.rinkworks.com/dialect/dialectt.cgi?dialect=" + encodeURIComponent(dialect) + "&text=" + encodeURIComponent(text), (error, response, body) => {
                    var handler = new HtmlParser.DefaultHandler();
                    var parser = new HtmlParser.Parser(handler);
                    parser.parseComplete(body);
                    var result = Select(handler.dom, ".dialectized_text p");
                    if (!result) {
                        return;
                    }
                    var dialectizedText = result[0].children[0].raw;
                    bot.sendChat(bot.identifier + dialectizedText.trim());
                });
            } else {
                bot.sendChat(bot.identifier + "to use do: !dialect [dialect] [message]");
            }
        }
    }
};
