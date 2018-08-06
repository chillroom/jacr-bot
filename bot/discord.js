const Discord = require('discord.js');
const moment = require("moment");

const config = require(`${process.cwd()}/config`);

let bot;
let client;
let guild;

function updateToken() {
	if (!(config.discord.token && config.discord.channel && config.discord.guild)) {
		bot.log("info", "DISCORD", "Discord integration is off.");
		return;
	}

	bot.log("info", "DISCORD", "Loading Discord integration...");

	client = new Discord.Client();

	client.on('ready', () => {
		const g = client.guilds.get(config.discord.guild);
		if (!g) {
			bot.log("error", "DISCORD", "Not connected to provided guild");
			return;
		}
		
		const chan = g.channels.get(config.discord.channel);
		if (!chan) {
			bot.log("error", "DISCORD", "Could not find expected channel on guild");
			return;
		}
		
		if (chan.type !== "text") {
			bot.log("error", "DISCORD", "channel on guild must be text channel");
			return;
		}

		guild = g;

		bot.log("info", "DISCORD", `Discord logged in as ${client.user.tag}!`);
	});

	// client.on('message', msg => {
	// 	console.log(msg);
	// 	if (msg.content === 'ping') {
	// 		msg.reply('pong');
	// 	}
	// });

	client.login(config.discord.token);
}

module.exports.init = receivedBot => {
	bot = receivedBot;
	updateToken();
};


const emoji = {
	soundcloud: "<:soundcloud:475839416108187650>",
	youtube: "<:youtube:475838992122642443>",
};

module.exports.onAdvance = data => {
	// console.log(data);
	const g = guild;

	const chan = g.channels.get(config.discord.channel);
	if (!chan) {
		bot.log("error", "DISCORD", "Could not find expected channel on guild");
		return;
	}

	let description = "Now playing this song from ";
	if (data.media.type === "soundcloud") {
		description += "Soundcloud ";
	} else if (data.media.type === "youtube") {
		description += "YouTube ";
	} else {
		description += data.media.type;
	}

	// Add emoji to end
	description += emoji[data.media.type] || "";

	const embed = new Discord.RichEmbed();
	embed.setURL(data.media.permalink_url);
	embed.setTitle(`:musical_note: ${data.media.name}`);
	embed.setThumbnail(data.media.images.thumbnail);
	embed.setColor([0, 255, 255]);
	embed.setDescription(description);
	embed.setAuthor(data.user.username, data.user.profileImage.secure_url, `https://dubtrack.fm/${data.user.username}`);
	embed.setFooter("Join us on Dubtrack at https://dubtrack.fm/join/just-a-chill-room.");
	embed.addField("Duration", moment.utc(data.media.songLength).format("H:mm:ss"));

	chan.send("", { embed })
		.catch(console.log);
};
