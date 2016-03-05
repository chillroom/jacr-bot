"use strict";

const Newrelic = require("newrelic");
const Hapi = require("hapi");
const logger = require("jethro");
const config = require(process.cwd() + "/config");
const server = new Hapi.Server();

server.connection({
    host: config.ipaddress,
    port: config.port,
    router: {
        stripTrailingSlash: true
    },
    routes: {
        cors: {
            origin: ["https://*.plugable.info", "https://*.dubtrack.fm", "http://just-a-chill-room.net"],
            headers: ["Accept", "Authorization", "Content-Type", "If-None-Match", "Accept-language"],
            credentials: true
        }
    }
});

server.register([
    {
        register: require(process.cwd() + "/app/server/src/plugins/db")
    }, {
        register: require(process.cwd() + "/app/server/src/plugins/logger"),
        options: {
            timeformat: "YYYY-MM-DD HH:mm:ss:SSS",
            output: {
                timestampOpts: {
                    utc: true
                }
            }
        }
    }, {
        register: require(process.cwd() + "/app/server/src/plugins/jwt")
    }, {
        register: require("hapi-authorization"),
        options: {
            roles: ["ADMIN", "MANAGER", "EDITOR"]
        }
    }, {
        register: require("./src/plugins/mailer"),
        options: {
            transport: {
                auth: {
                    api_key: config.mailer.api_key
                }
            }
        }
    }
], (err) => {
    if (err) {
        logger("info", "API", err);
        throw err;
    } else {
        server.start(() => {
            logger("info", "API", "server running at " + server.info.uri);
        });
        require("./src/router.js")(server);
    }
});
