"use strict";

const request = require("request");
const config = require(process.cwd() + "/config");

module.exports = (req, reply) => {
    request.post({
        url: "https://" + config.slack.url + "/api/users.list",
        form: {
            token: config.slack.token,
            presence: 1
        }
    }, (err, resp, body) => {
        if (err) {
            reply({
                status: 200,
                code: "something_wrong",
                message: "Something went wrong"
            });
        } else {
            body = JSON.parse(body);
            if (body.ok) {

                let users = body.members;
                users = users.filter((x) => {
                    return !x.is_bot && !x.deleted;
                });
                const total = users.length;
                users = users.filter((x) => {
                    return x.presence === "active";
                });
                const online = users.length;
                request.get({
                    url: "https://img.shields.io/badge/Slack-" + online + "%2F" + total + "-E01563.svg"
                }, (err, resp, body) => {
                    if (err) {
                        reply({
                            status: 200,
                            code: "something_wrong",
                            message: "Something went wrong"
                        });
                    } else {
                        reply(body).header("Content-Type", "image/svg+xml").header("Cache-Control", "max-age=0, no-cache");
                    }
                });
            }
        }
    });
};
