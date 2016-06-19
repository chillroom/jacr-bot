module.exports = {
	ipaddress: process.env.OPENSHIFT_NODEJS_IP,
	port: process.env.OPENSHIFT_NODEJS_PORT,
	origins: process.env.ORIGINS,
	bot: {
		name: process.env.BOT_NAME,
		pass: process.env.BOT_PASS,
		URL: process.env.BOT_URL
	},
	mongoURL: process.env.MONGO_URL,
	slack: {
		URL: process.env.SLACK_URL,
		channels: process.env.SLACK_CHANNELS,
		message: process.env.SLACK_MESSAGE,
		token: process.env.SLACK_TOKEN
	},
	socialLink: process.env.SOCIAL_LINK,

	lastfm: {
		LFM_APIKEY: process.env.LFM_APIKEY,
		LFM_APISECRET: process.env.LFM_APISECRET,
		LFM_USERNAME: process.env.LFM_USERNAME,
		LFM_PASSWORD: process.env.LFM_PASSWORD
	},

	rethinkdb: {
		database: process.env.RETHINKDB_DATABASE,
		username: process.env.RETHINKDB_USERNAME,
		password: process.env.RETHINKDB_PASSWORD
	}
};
