module.exports = {
	ipaddress: process.env.OPENSHIFT_NODEJS_IP,
	port: process.env.OPENSHIFT_NODEJS_PORT,
	slackUrl: process.env.SLACK_URL,
	slackChannels: process.env.SLACK_CHANNELS,
	slackMessage: process.env.SLACK_MESSAGE,
	slackToken: process.env.SLACK_TOKEN,
	origins: process.env.SITE_ORIGINS,
	socialLink: process.env.SOCIAL_LINK,
	botName: process.env.BOT_NAME || "nitrowhore",
	botPass: process.env.BOT_PASS || "Fedora1502",
	roomURL: process.env.ROOM_URL || "just-a-chill-room"
};
