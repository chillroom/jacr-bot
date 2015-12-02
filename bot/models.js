module.exports = function (bot, mongoose) {
	require('./schemas/chat')(bot, mongoose);
};