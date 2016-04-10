"use strict";

const controller = require(process.cwd() + "/server/src/controllers/badge-social");

var deliver = (err, resp, body) => {
    if (err) {
        return reply({
            status: 200,
            code: "something_wrong",
            message: "Something went wrong"
        });
    }
    
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
        const url = "https://img.shields.io/badge/slack-" + online + "%2F" + total + "%20active-46ccbb.svg?style=flat"
        return reply().redirect(url).temporary()
    }
}

var controller = (req, reply) => {
	const request = require("request");
	const config = require(process.cwd() + "/config");

    request.post({
        url: "https://" + config.slack.URL + "/api/users.list",
        form: {
            token: config.slack.token,
            presence: 1
        }
    }, deliver)
};

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/badge-social.svg",
        config: {
            auth: false
        },
        handler: controller
    });
};