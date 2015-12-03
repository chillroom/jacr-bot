module.exports = function (bot, mongoose) {
	require("./schemas/settings")(bot, mongoose);
	require("./schemas/chat")(bot, mongoose);
	require("./schemas/emojiCount")(bot, mongoose);
	require("./schemas/emojiDaysTrack")(bot, mongoose);
};
