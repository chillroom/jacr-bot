"use strict";

const Fs = require("fs");
const Path = require("path");
const Hoek = require("hoek");
const Items = require("items");
const Joi = require("joi");
const Nodemailer = require("nodemailer");
const Handlebars = require("handlebars");
const InlineBase64 = require("nodemailer-plugin-inline-base64");

const internals = {};

internals.defaults = {
	        transport: {},
	        inlineImages: false
};

internals.schema = Joi.object({
	        transport: Joi.object(),
	        inlineImages: Joi.boolean()
});

internals.templateCache = {};

internals.renderTemplate = (signature, context, callback) => {
	        if (!signature) {
		        return callback(null);
	}
	        if (internals.templateCache[signature]) {
		        callback(null, internals.templateCache[signature](context));
	}
	        const filePath = Path.resolve(process.cwd() + "/src/emails/", signature);
	        const options = {
		        encoding: "utf-8"
	};
	        Fs.readFile(filePath, options, (err, source) => {
		        if (err) {
			        return callback(err);
		}
		        internals.templateCache[signature] = Handlebars.compile(source);
		        callback(null, internals.templateCache[signature](context));
	});
};

exports.register = function (server, options, next) {
	        Joi.assert(options, internals.schema);
	        const config = Hoek.applyToDefaults(internals.defaults, options);
	        const transport = Nodemailer.createTransport(config.transport);
	        if (config.inlineImages) {
		        transport.use("compile", InlineBase64);
	}
	        server.expose("send", (data, callback) => {
		        Items.parallel(["text", "html"], (format, cb) => {
			        const signature = typeof data[format] === "object" ? data[format].template : "";
			        internals.renderTemplate(signature, data.context, (err, content) => {
				        if (err) {
					        cb(err);
				}
				        data[format] = content;
				        return cb();
			});
		}, (err) => {
			        if (err) {
				        return callback(err);
			}
			        delete data.context;
			        transport.sendMail(data, callback);
		});
	});
	        next();
};

exports.register.attributes = {
	        name: "mailer"
};
