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
        cors: true
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
