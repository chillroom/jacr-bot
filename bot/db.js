var r = require('rethinkdb');
const config = require(process.cwd() + "/config");

var callback;
var log;
r.connect( {
	host: 'localhost',
	port: 28015,
	db: config.rethinkdb.database,
	user: config.rethinkdb.username,
	password: config.rethinkdb.password
},	function(err, conn) {
    	if (err) throw err;
    	
    	log("info", "RETHINK", "Connected!");
    	callback(conn)
	}
)

module.exports = function(logger, cb) {
	callback = cb
	log = logger
}