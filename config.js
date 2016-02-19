module.exports = {
    ipaddress: process.env.OPENSHIFT_NODEJS_IP,
	port: process.env.OPENSHIFT_NODEJS_PORT,
    bot: {
        name: process.env.BOT_NAME,
        pass: process.env.BOT_PASS,
        URL: process.env.BOT_URL
    },
    jenkins: {
        user: process.env.JENKINS_USER,
        token: process.env.JENKINS_TOKEN,
        URL: process.env.JENKINS_SITE
    },
    jwt: {
		key: process.env.JWT_KEY,
		ttl: 7 * 24 * 60 * 60 * 1000,
		cookie_options: {
			ttl: 7 * 24 * 60 * 60 * 1000,
			encoding: "none",
			isSecure: false,
			isHttpOnly: true,
			clearInvalid: true,
			strictHeader: true,
			domain: process.env.PUBLIC_HOST,
			path: "/"
		}
	},
    mailer: {
		service: process.env.MAILER_SERVICE,
		user: process.env.MAILER_USER,
		pass: process.env.MAILER_PASS
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
