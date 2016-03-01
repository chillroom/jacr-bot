"use strict";

const config = require(process.cwd() + "/config");

module.exports = (req, reply) => {
    reply({
      statusCode: 200,
      message: "Session verified."
  }).header("Authorization", req.headers.authorization).state("token", req.headers.authorization, {
      ttl: config.jwt.ttl
  });
};
