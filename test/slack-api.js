/*global describe:true, it:true */

"use strict";

var should = require("should"),
	request = require("supertest"),
	config = require("../config"),
	url = "http://" + config.ipaddress + ":" + config.port;


describe("Test Slack API routes", function () {
	require("../app/server");
	it("GET /", function (done) {
		this.slow(100);
		this.timeout(2000);
		request(url)
			.get("/")
			.expect("Content-Type", /json/)
			.expect(200)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				res.status.should.equal(200);
				res.body.code.should.equal("online");
				return done();
			});
	});

	it("GET /users", function (done) {
		this.slow(3000);
		this.timeout(4000);
		request(url)
			.get("/users")
			.expect("Content-Type", /json/)
			.expect(200)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				res.status.should.equal(200);
				res.body.code.should.equal("ok");
				res.body.users.online.should.be.a.Number();
				res.body.users.total.should.be.a.Number();
				return done();
			});
	});

	it("GET /badge.svg", function (done) {
		this.slow(3000);
		this.timeout(4000);
		request(url)
			.get("/badge.svg")
			.expect("Content-Type", /svg/)
			.expect(200)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				res.status.should.equal(200);
				return done();
			});
	});

	it("GET /badge-social.svg", function (done) {
		this.slow(3000);
		this.timeout(4000);
		request(url)
			.get("/badge-social.svg")
			.expect("Content-Type", /svg/)
			.expect(200)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				res.status.should.equal(200);
				return done();
			});
	});

	it("GET /badge-coverage.svg", function (done) {
		this.slow(1500);
		this.timeout(4000);
		request(url)
			.get("/badge-coverage.svg")
			.expect("Content-Type", /svg/)
			.expect(200)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				res.status.should.equal(200);
				return done();
			});
	});

	it("POST /invite", function (done) {
		this.slow(1000);
		this.timeout(2000);
		request(url)
			.post("/invite")
			.send({
				email: "test@test.com"
			})
			.expect("Content-Type", /json/)
			.expect(200)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				res.status.should.equal(200);
				return done();
			});
	});
});
