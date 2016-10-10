const moment = require("moment");

function buildDescription(doc) {
	if (doc.type === "message") {
		return `saying "${doc.message}"`;
	} else {
		return "doing something..";
	}
}

module.exports = (bot, data) => {
	const r = bot.rethink;

	if (data.params == null) {
		bot.sendChat(`@${data.user.username} - See when someone last did something - Usage: !seen @user`);
		return;
	}
	
	const targetName = (data.params[0].charAt(0) == "@") ? data.params[0].slice(1) : data.params[0];

	r
  		.db("jacr")
		.table('users')
  		.filter({ platform: "dubtrack" })
		.filter(
			r.row.getField("username").downcase().eq(targetName.toLowerCase())
		)("seen")
		.run()
		.then(docs => {
			if (docs.length === 0) {
				bot.sendChat(`@${data.user.username}, I don't know who '${targetName}' is!`);
				return;
			}

			if (docs.length > 1) {
				bot.sendChat(`@${data.user.username}, somehow there are multiple people with that name... tell @qaisjp to fix this!`);
				return;
			}

			const doc = docs[0];
			bot.sendChat(`@${data.user.username} - ${moment(doc.time).fromNow()}, '${targetName}' was last seen ${buildDescription(doc)}.`);

			return;
		});
};
