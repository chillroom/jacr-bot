module.exports = (bot, data) => {
    const user = data.user.username;

    let username = data.user.username;
    if (data.params[0] != null) {
        username = data.params[0].toLowerCase();
        if (username.substr(0, 1) === "@") {
            username = username.substr(1);
        }
    }

    bot.rethink
        .table("users")
        .getAll(username, { index: "username" })
        .filter({platform: "dubtrack"})
        .run().then(docs => {
            if (docs.length === 0) {
                bot.sendChat(`@${data.user.username}, I don't know who ${username} is!`);
                return;
            } else if (docs.length !== 1) {
                bot.sendChat(`@${data.user.username}, I found multiple people?? Tell @qaisjp about ${outName}!`);
                return;
            }

            const doc = docs[0];
            bot.sendChat(`${username} - karma(${doc.karma})`);
            return;
        });
};
