const db = require("../lib/db");

function outputUsage(bot) {
	bot.sendChat("Usage: https://github.com/chillroom/jacr-bot/wiki/Commands#responses");
}

function add(bot, cmd, message) {
	if (message === "") {
		bot.sendChat("Empty message!");
		return;
	}

	// Does a group matching that name already exist?
	db.query(`select "group" from response_commands WHERE name = $1 limit 1`, [cmd]).then(res => {
		if (res.rowCount === 0) {
			// Create a group and add a command with that id
			db.query(
				`
				with resgroup as (
					insert into response_groups(messages) values (array[$2]) returning id
				)
				insert into response_commands (name, "group")
				values ($1, (select id from resgroup))
				`,
				[cmd, message]
			).catch(bot.errLog);

			return;
		}

		db.query(
			`update response_groups set messages = array_append(messages, $1) where id = $2`,
			[message, res.rows[0].group]
		).catch(bot.errLog);
	}).catch(bot.errLog);
}

function del(bot, cmd, message) {
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
	).catch(bot.errLog);
}

function delall(bot, cmd) {
	db.query(
		`delete from response_commands where name = $1`,
		[cmd]
	).catch(bot.errLog);
}

function link(bot, cmdA, cmdB) {
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
		).catch(bot.errLog);
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
			bot,
			data.params[1],
			data.params.slice(2).join(" ")
		);
		break;
	case 'del':
		del(
			bot,
			data.params[1],
			data.params.slice(2).join(" ")
		);
		break;
	case 'delall':
		delall(bot, data.params[1]);
		break;
	case 'link':
		link(bot, data.params[1], data.params[2]);
		break;
	default:
		outputUsage(bot);
		break;
	}
};
