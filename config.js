module.exports = {
	ipaddress: process.env.OPENSHIFT_NODEJS_IP,
	port: process.env.OPENSHIFT_NODEJS_PORT,
	origins: process.env.ORIGINS,
	bot: {
		name: process.env.BOT_NAME,
		pass: process.env.BOT_PASS,
		URL: process.env.BOT_URL,
	},
	
	slack: {
		URL: process.env.SLACK_URL,
		channels: process.env.SLACK_CHANNELS,
		message: process.env.SLACK_MESSAGE,
		token: process.env.SLACK_TOKEN,
	},
	socialLink: process.env.SOCIAL_LINK,

	lastfm: {
		LFM_APIKEY: process.env.LFM_APIKEY,
		LFM_APISECRET: process.env.LFM_APISECRET,
		LFM_USERNAME: process.env.LFM_USERNAME,
		LFM_PASSWORD: process.env.LFM_PASSWORD,
	},

	postgres: {
		host: process.env.POSTGRES_ADDRESS,
		db: process.env.POSTGRES_DB,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
	},

	artsy: {
		clientID: process.env.ARTSY_CLIENT_ID,
		clientSecret: process.env.ARTSY_CLIENT_SECRET,
	},

	google_api_key: process.env.GOOGLE_API_KEY,
	soundcloud_api_key: process.env.SOUNDCLOUD_API_KEY,
};
