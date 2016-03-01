module.exports = {
	ipaddress: process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
	port: process.env.OPENSHIFT_NODEJS_PORT || "8357",
	socialLink: process.env.SOCIAL_LINK || "https://justachillroom.slack.com",
    mongoURL: process.env.MONGO_URL || "mongodb://illumibot:1llum1b0t1502@ds027825.mongolab.com:27825/illumibot",
    slack: {
        URL: process.env.SLACK_URL || "justachillroom.slack.com",
        channels: process.env.SLACK_CHANNELS || "C0BNC6S4R,C0DGK4HJB,C0A8KBMU7",
        message: process.env.SLACK_MESSAGE || "test",
        Token: process.env.SLACK_TOKEN || "xoxp-10291034036-10292039477-10292813365-35fe2f"
    },
    bot: {
        name: process.env.BOT_NAME || "nitrowhore",
        pass: process.env.BOT_PASS || "Fedora1502",
        URL: process.env.BOT_URL || "nitrowhore"
    },
    jwt: {
		key: process.env.JWT_KEY || "8seYl8viynycYOXX0XaHMoo5LQ1nxVAqnyEcZ7Cr",
		ttl: 1 * 60 * 60 * 1000,
		cookie_options: {
			ttl: 1 * 60 * 60 * 1000,
			encoding: "none",
			isSecure: true,
			isHttpOnly: true,
			clearInvalid: true,
			strictHeader: true,
			domain: process.env.PUBLIC_HOST || "localhost",
			path: "/"
		}
	},
    mailer: {
		api_key: "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"
	}
};
