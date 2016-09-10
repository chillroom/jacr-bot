module.exports = (bot, data) => {
	const r = bot.rethink
	const DJ = bot.getDJ();
	const user = data.user.username;
	const rank = data.user.role;
	
	if (bot.vips.indexOf(rank) === -1) {
		bot.log("info", "SKIP", user + " tried to skip a song without the required permissions");
		return;
	}

	if (data.params == null) {
		return;
	}

	if (bot.protection) {
		return;
	}

	bot.protection = true;
	setTimeout(() => {
		bot.protection = false;
	}, 5000);

	bot.log("info", "SKIP", user + " skipped the current song.");

	var lockskip = false;
	const skip = () => {
		bot.moderateSkip(() => {
			if (!lockskip) {
				return;
			}

			bot.once("room_playlist-queue-update-dub", () => {
				bot.moderateMoveDJ(DJ.id, 1);
			});
		});
	};

	if (data.params.length === 0) {
		bot.sendChat("No reason given. If you supply a reason (op, forbidden, unavailable, nsfw, theme), I will be able to autoskip it next time");
		skip();
		return;
	}

	var skipReason = null;
	var media = bot.getMedia();
	switch (data.params[0]) {
	case "unpop":
	case "shit":
		bot.sendChat("Awww shucks, your song has been voted by the community as unpopular. Please check theme for guidance on what to play. http://just-a-chill-room.net/rules/#theme");
		break;
	case "op":
		skipReason = "op";
		bot.sendChat("Song skipped for being op, check http://just-a-chill-room.net/op-forbidden-list/ next time please");
		lockskip = true;
		break;
	case "length":
	case "len":
		bot.sendChat("Song has been skipped because it is too long.");
		break;
	case "history":
	case "hist":
		bot.sendChat("Song was recently played, history can be viewed by clicking queue then room history.");
		lockskip = true;
		break;
	case "nsfw":
		skipReason = "nsfw";
		bot.sendChat("Song skipped for being NSFW, too much NSFW = ban!");
		break;
	case "theme":
		skipReason = "theme";
		bot.sendChat("Song does not fit the room theme.");
		break;
	case "forbidden":
		skipReason = "forbidden";
		bot.sendChat("This song is on the forbidden list: http://just-a-chill-room.net/op-forbidden-list/");
		break;
	case "na":
	case "unv":
	case "unav":
	case "unavailable":
		skipReason = "unavailable";
		bot.sendChat("This song is not available to all users");
		lockskip = true;
		break;
	case "troll":
		skipReason = "forbidden";
		if (bot.ranks.indexOf(DJ.role) === -1) {
			bot.moderateBanUser(DJ.id, 0);
		}
		break;
	default:
		bot.sendChat("Parameter not recognised, but you can suggest it (see !suggest)");
	}

	skip();

	if (skipReason != null) {
		r.table("songs").filter({type: media.type, fkid: media.fkid}).update({skipReason: skipReason}).run().error(bot.errLog);
	}
};
