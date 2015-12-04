var gulp = require("gulp"),
	rename = require("gulp-rename");

gulp.task("config", function () {
	return gulp.src(__dirname + "/config.example.js")
		.pipe(rename(__dirname + "/config.js"))
		.pipe(gulp.dest("."));
});

gulp.task("mine", function () {
	return gulp.src(__dirname + "/config.mine.js")
		.pipe(rename(__dirname + "/config.js"))
		.pipe(gulp.dest("."));
});

gulp.task("default", ["config"]);
