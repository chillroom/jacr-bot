"use strict";

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
            origin: ["https://api.just-a-chill-room.net", "https://*.dubtrack.fm", "http://just-a-chill-room.net"],
            headers: ["Accept", "Authorization", "Content-Type", "If-None-Match", "Accept-language"],
            credentials: true
        }
    }
});

server.register([
    {
        register: require(process.cwd() + "/server/src/plugins/db")
    }, {
        register: require(process.cwd() + "/server/src/plugins/logger"),
        options: {
            timeformat: "YYYY-MM-DD HH:mm:ss:SSS",
            output: {
                timestampOpts: {
                    utc: true
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
