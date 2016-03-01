module.exports = {
    ipaddress: process.env.OPENSHIFT_NODEJS_IP,
	  port: process.env.OPENSHIFT_NODEJS_PORT,
    origins: process.env.ORIGINS,
    bot: {
        name: process.env.BOT_NAME,
        pass: process.env.BOT_PASS,
        URL: process.env.BOT_URL
    },
    jwt: {
		key: process.env.JWT_KEY,
		ttl: 7 * 24 * 60 * 60 * 1000,
		cookie_options: {
			ttl: 7 * 24 * 60 * 60 * 1000,
			encoding: "none",
			isSecure: false,
			isHttpOnly: true,
			clearInvalid: false,
			strictHeader: false,
			domain: process.env.PUBLIC_HOST,
			path: "/"
		}
	},
    mailer: {
		api_key: process.env.MAILER_API
	},
    mongoURL: process.env.MONGO_URL,
    slack: {
        URL: process.env.SLACK_URL,
        channels: process.env.SLACK_CHANNELS,
        message: process.env.SLACK_MESSAGE,
        Token: process.env.SLACK_TOKEN
    },
	socialLink: process.env.SOCIAL_LINK
};
