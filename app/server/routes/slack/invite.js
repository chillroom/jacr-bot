var request = require("request"),
	config = require(process.cwd() + "/config");

module.exports = function (server) {
	server.post("/invite", function (req, res, next) {
		/* istanbul ignore else  */
		if (req.body.email) {
			request.post({
				url: "https://" + config.slackUrl + "/api/users.admin.invite",
				form: {
					email: req.body.email,
					channels: config.slackChannels,
					token: config.slackToken,
					extra_message: config.slackMessage,
					set_active: true,
					_attempts: 1
				}
			}, function (err, response, body) {
				/* istanbul ignore if  */
				if (err) {
					res.json({
						code: "something_wrong",
						message: err
					});
				}
				body = JSON.parse(body);
				/* istanbul ignore if  */
				if (body.ok) {
					res.json({
						code: "invite_sent",
						message: "invite has been sent to: " + req.body.email
					});
				} else {
					/* istanbul ignore else  */
					if (body.error === "already_invited") {
						res.json({
							code: "already_invited",
							message: "already invited you silly sausage!"
						});
					} else if (body.error === "invalid_email") {
						res.json({
							code: "invalid_email",
							message: "invalid email entered you silly sausage!"
						});
					} else if (body.error === "already_in_team") {
						res.json({
							code: "already_in_team",
							message: "already in the team you silly sausage!"
						});
					} else {
						res.json({
							code: "slack_error",
							message: body.error
						});
					}
				}
			});
		} else {
			res.json({
				code: "email_required",
				message: "no email entered you silly sausage!"
			});
		}
		return next();
	});
};
