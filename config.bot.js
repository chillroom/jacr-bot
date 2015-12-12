module.exports = {
	ipaddress: process.env.OPENSHIFT_NODEJS_IP,
	port: process.env.OPENSHIFT_NODEJS_PORT,
	slackUrl: process.env.SLACK_URL,
	slackChannels: process.env.SLACK_CHANNELS,
	slackMessage: process.env.SLACK_MESSAGE,
	slackToken: process.env.SLACK_TOKEN,
	origins: process.env.SITE_ORIGINS,
	socialLink: process.env.SOCIAL_LINK,
	botName: process.env.BOT_NAME,
	botPass: process.env.BOT_PASS,
	roomURL: process.env.ROOM_URL,
	mongoURL: process.env.MONGO_URL,
	jenkinsUser: process.env.JENKINS_USER,
	jenkinsToken: process.env.JENKINS_TOKEN,
	jenkinsURL: process.env.JENKINS_SITE
};
