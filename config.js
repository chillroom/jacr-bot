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
  socialLink: process.env.SOCIAL_LINK
};
