const db = require("../lib/db");

function outputUsage(bot) {
	bot.sendChat("Usage: https://github.com/chillroom/jacr-bot/wiki/Commands#responses");
}

function add(bot, data, cmd, message) {
	if (message === "") {
		bot.sendChat("Empty message!");
		return;
	}

	// Does a group matching that name already exist?
	db.query(`select add_response_message($1, $2)`, [cmd, message]).then(() => {
		bot.moderateDeleteChat(data.id);
	}).catch(bot.errLog);
}

function del(bot, data, cmd, message) {
	if (message === "") {
		bot.sendChat("Empty message!");
		return;
	}

	db.query(
		`
			with groups as (
				select "group" as id from response_commands where name=$1
			)
			update only response_groups
			set messages = array_remove(messages, $2)
			from groups where (groups.id = response_groups.id)
		`,
		[cmd, message]
	).then(() => {
		bot.moderateDeleteChat(data.id);
	}).catch(bot.errLog);
}

function delall(bot, data, cmd) {
	db.query(
		`delete from response_commands where name = $1`,
		[cmd]
	).then(() => {
		bot.moderateDeleteChat(data.id);
	}).catch(bot.errLog);
}

function link(bot, data, cmdA, cmdB) {
	// Look for commands that already exist
	db.query(
		`select * from response_commands where (name = $1) or (name = $2)`,
		[cmdA, cmdB]
	).then(res => {
		if (res.rowCount === 0) {
			bot.sendChat(`Neither ${cmdA} or ${cmdB} exist.`);
			return;
		} else if (res.rowCount > 1) {
			bot.sendChat(`Both commands already exist.`);
			return;
		}

		// Determine which one does not exist
		const newCmd = (res.rows[0].name === cmdA) ? cmdB : cmdA;
		db.query(
			`insert into response_commands (name, "group") values ($1, $2)`,
			[newCmd, res.rows[0].group]
		).then(() => {
			bot.moderateDeleteChat(data.id);
		}).catch(bot.errLog);
	}).catch(bot.errLog);
}

module.exports = (bot, data) => {
	if (bot.vips.indexOf(data.user.role) === -1) {
		bot.sendChat("Access denied.");
		return;
	}

	if (data.params.length === 0) {
		outputUsage(bot);
		return;
	}

	switch (data.params[0]) {
	case 'add':
		add(
			bot, data,
			data.params[1],
			data.params.slice(2).join(" ")
		);
		break;
	case 'del':
		del(
			bot, data,
			data.params[1],
			data.params.slice(2).join(" ")
		);
		break;
	case 'delall':
		delall(bot, data, data.params[1]);
		break;
	case 'link':
		link(bot, data, data.params[1], data.params[2]);
		break;
	default:
		outputUsage(bot);
		break;
	}
};
