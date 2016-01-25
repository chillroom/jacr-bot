"use strict";

const Hapi = require("hapi");
const logger = require("jethro");
const config = require(process.cwd() + "/config");
const server = new Hapi.Server();

server.connection({
    host: config.ipaddress,
    port: config.port
});

server.register([{
    register: require("hapi-mongodb"),
    options: {
        url: config.APIMongoURL
    }
}], (err) => {
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