var log = require('jethro'),
	spawn = require('child_process').spawn,
	child;

function restartApp() {
	var git = spawn('git', ['pull']);
	git.stdout.setEncoding('utf8');
	git.stdout.on('data', function (data) {
		var str = data.toString().trim().split("\n");
		str.forEach(function (str) {
			log('info', 'git', str);
		});
	});
	git.on('close', function () {
		var npm = spawn('npm.cmd', ['install']);
		npm.stdout.setEncoding('utf8');
		npm.stdout.on('data', function (data) {
			var str = data.toString().trim().split("\n");
			str.forEach(function (str) {
				log('info', 'npm', str);
			});
		});
		npm.on('close', function () {
			if (child) {
				child.kill();
			}
			startApp();
		});
	});
}

function startApp() {
	child = spawn('node', ['bot.js']);
	child.stdout.setEncoding('utf8');
	child.stdout.on('data', function (data) {
		var str = data.toString().trim().split("\n"),
			regRestart = new RegExp("r3st4rt"),
			regOnline = new RegExp("on71n3"),
			regKill = new RegExp("k177");
		str.forEach(function (str) {
			if (regRestart.test(str)) {
				log('warning', 'bot', 'Restarting Bot!')
				restartApp();
			} else if (regOnline.test(str)) {
				log('success', 'bot', 'Bot successfully online!');
			} else if (regKill.test(str)) {
				setTimeout(function () {
					child.kill();
				}, 2000);
			} else {
				log('info', 'bot', str);
			}
		});
	});
	child.on('close', function (code) {
		log('warning', 'close', 'process exit code ' + code);
	});
}

restartApp();
