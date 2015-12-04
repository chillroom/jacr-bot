var gulp = require("gulp"),
	rename = require("gulp-rename");

gulp.task("config", function () {
	return gulp.src("./config.example.js")
		.pipe(rename("./config.js"))
		.pipe(gulp.dest("."));
});

gulp.task("mine", function () {
	return gulp.src("./config.mine.js")
		.pipe(rename("./config.js"))
		.pipe(gulp.dest("."));
});

gulp.task("default", ["config"]);
