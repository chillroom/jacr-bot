// Copyright (c) Qais Patankar 2016 - MIT License
const moment = require("moment");
const db = require("./lib/db");

let bot;

class MOTD {
	constructor(receivedBot) {
		bot = receivedBot;
		
		this.messageCount = 0;
		this.onAdvance = () => {};
		this.messages = [];

		// Add the command counter
		const event = require("./events/chat-message.js");
		event.AddCommand("motd", (_, data) => { this.onCommand(data); });
		event.AddHandler("motd", (data) => { this.onChat(data); });

		this.reload();
	}

	onChat(data) {
		if (data.user.username === bot._.self.username) {
			return;
		}

		this.messageCount += 1;

		if (this.messageCount >= this.settings.Interval) {
			this.sendMOTD();
		}
	}

	setEnabled(b, announce) {
		this.settings.Enabled = b;

		if (announce) {
			bot.sendChat(`MOTD has been ${b ? 'enabled' : 'disabled'}.`);
		}
	}

	onCommand(data) {
		// ensure we're a moderator
		if (bot.ranks.indexOf(data.user.role) === -1) {
			return;
		}
		
		bot.moderateDeleteChat(data.id);

		// If you edit this data.params[0], also edit 'enabled'/'disable' code below.
		switch (data.params[0]) {
		default:
			bot.sendChat(`@${data.user.username}: !motd (enable|disable|status|list|reload)`);
			break;
		case "enable":
		case "disable":
			this.setEnabled(data.params[0] === 'enable');
			break;
		case "status":
			bot.sendChat(`There are ${this.messages.length} messages. MOTD is ${this.settings.Enabled ? '' : 'not '}enabled. Interval: ${this.settings.Interval}. Next message: ${this.settings.NextMessage}. Last announce: ${this.settings.LastAnnounceTime}.`);
			break;
		case "list":
			bot.sendChat("Please see https://api.just-a-chill-room.net/motd/list?mode=pretty");
			break;
		case "reload":
			this.reload();
			break;
		}
	}

	sendMOTD() {
		if (!this.settings.Enabled) {
			return;
		}

		this.messageCount = 0; // Reset messages counter
		let currentMessage = this.messages[this.settings.NextMessage];

		// Check if a currentMessage exists
		if (currentMessage == null) {
			// Let's try to send the first message. Let's check
			// if there are any messages at all before we do anything.
			if (this.messages.length === 0) {
				bot.log("Tried broadcasting message without any messages.");
				this.setEnabled(false);
				return;
			}

			// If we have message, set the nextMessage to 0, and retry.
			this.settings.NextMessage = 0;
			this.sendMOTD();
			return;
		}

		// Awesome. Now let's just send the message!
		bot.sendChat(currentMessage.message);

		// Update the state
		this.settings.LastAnnounceTime = new Date(); // now!
		this.settings.NextMessage += 1; // Increment the nextMessage counter

		// Commit the state to database
		const js = JSON.stringify(this.settings);
		db.query("INSERT INTO settings(name, value) VALUES ('motd', $1) ON CONFLICT(name) DO UPDATE SET value = $1;", [js], (err, _) => {
			if (bot.checkError(err, "pgsql", 'could not update settings')) {
				return;
			}
		});
	}

	validate() {
		let changed = false;

		if (this.settings == null) {
			this.settings = {};
			changed = true;
		}

		if (this.settings.Enabled !== true && this.settings.Enabled !== false) {
			this.settings.Enabled = false;
			changed = true;
		}

		let rounded = Math.round(this.settings.Interval);
		if (isNaN(rounded)) {
			this.settings.Interval = 30;
			changed = true;
		} else if (rounded != this.settings.Interval) {
			this.settings.Interval = rounded;
			changed = true;
		}

		rounded = Math.round(this.settings.NextMessage);
		if (isNaN(rounded)) {
			this.settings.NextMessage = 1;
			changed = true;
		} else if (rounded !== this.settings.NextMessage) {
			this.settings.NextMessage = rounded;
			changed = true;
		}

		if (this.settings.LastAnnounceTime == null || !moment(this.settings.LastAnnounceTime).isValid()) {
			this.settings.LastAnnounceTime = moment();
			changed = true;
		}

		if (changed) {
			db.query(
				"INSERT INTO settings(name, value) VALUES('motd', $1) ON CONFLICT(name) DO UPDATE SET value = $1",
				[JSON.stringify(this.settings)],
				bot.dbLog("Internal error. Could not insert verified settings.")
			);
		}
	}

	// updateInformation triggers information reloading
	reload() {
		// reset our settings and state objects
		this.settings = null;
		this.messages = [];

		db.query("SELECT * FROM notices; SELECT * FROM settings WHERE name = 'motd'", [], (err, res) => {
			if (bot.checkError(err, "pgsql", 'could not receive notices')) {
				return;
			}

			for (const row of res.rows) {
				// If settings
				if (row.name === 'motd') {
					this.settings = row.value;
				} else {
					this.messages.push(row);
				}
			}

			this.validate();

			// If 15 minutes has passed since the last announce time
			if (moment(this.settings.LastAnnounceTime).add(15, "minutes").isBefore()) {
				this.sendMOTD();
				return;
			}
		});
	}
}

module.exports = MOTD;
