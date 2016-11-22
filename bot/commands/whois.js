module.exports = (bot, data) => {
    const user = data.user.username;

    let username = data.user.username;
    if (data.params[0] != null) {
        username = data.params[0];
        if (username.substr(0, 1) === "@") {
            username = username.substr(1);
        }
    }

    bot.rethink
        .table("users")
        .getAll(username.toLowerCase(), { index: "username_l" })
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
            var user = bot.getUserByName(username);
            user = (user == null) ? {} : user

            bot.sendChat(`${username} | JACR: karma(${doc.karma}), | Dubtrack: songsInQueue(${user.songsInQueue}), dubs(${user.dubs})`);
            return;
        });
};
