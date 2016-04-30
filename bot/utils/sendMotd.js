module.exports = (bot) => {
    bot.sendMotd = () => {
        bot.db.models.settings.findOne({
            id: "s3tt1ng5"
        }, (err, doc) => {
            
            doc.songCount++;
            doc.save();
            if (doc.motd.enabled) {
                if (doc.songCount % doc.motd.interval === 0) {
                    bot.sendChat(bot.identifier + doc.motd.msg);
                }
            }
        });
    };
};
