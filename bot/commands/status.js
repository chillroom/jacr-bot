const Raffle = require("../raffle");
const Event = require("../event");

const enabled = ["enabled", "disabled"];
const started = ['started', 'stopped'];

function format(str, state, output) {
	return ` ${str}(${state ? output[0] : output[1]})`;
}

module.exports = bot => {
	let message = "Status:";

	message += format('raffle', Raffle.settings.enabled, enabled);
	message += format('event', Event.isActive(), started);
	message += format('motd', bot.motd.settings.Enabled, enabled);
	message += format('queuelock', bot.getRoomMeta().lockQueue, enabled);

	bot.sendChat(message);
};
