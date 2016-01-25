"use strict";

const request = require("request");
const config = require(process.cwd() + "/config");

module.exports = (req, reply) => {
    if (req.payload.email) {
        request.post({
            url: "https://" + config.slackUrl + "/api/users.admin.invite",
            form: {
                email: req.payload.email,
                channels: config.slackChannels,
                token: config.slackToken,
                extra_message: config.slackMessage,
                set_active: true,
                _attempts: 1
            }
        }, (err, resp, body) => {
            if (err) {
                reply({
                    status: 500,
                    code: "something_wrong",
                    message: "Something went wrong"
                }).code(500);
            } else {
                body = JSON.parse(body);
                if (body.ok) {
                    reply({
                        status: 200,
                        code: "invite_sent",
                        message: "Invite has been sent to: " + req.payload.email
                    });
                } else {
                    if (body.error === "already_invited") {
                        reply({
                            status: 200,
                            code: "already_invited",
                            message: "Invite has already been sent to: " + req.payload.email
                        });
                    } else if (body.error === "already_in_team") {
                        reply({
                            status: 200,
                            code: "already_in_team",
                            message: "Already a part of the slack team. Please login at " + config.slackUrl + " with email: " + req.payload.email
                        });
                    } else if (body.error === "invalid_email") {
                        reply({
                            status: 400,
                            code: "invalid_email",
                            message: "Invalid email address entered. Please input a valid email address and try again"
                        }).code(400);
                    } else {
                        reply({
                            status: 200,
                            code: "slack_error",
                            message: body.error
                        });
                    }
                }
            }
        });
    } else {
        reply({
            status: 400,
            code: "email_required",
            "message": "Email address required"
        }).code(400);
    }
};