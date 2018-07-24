var gulp = require("gulp");
var path = require("path");
var del = require("del");
var tslint = require("gulp-tslint");
var jasmine = require("gulp-jasmine");
var istanbul = require("gulp-istanbul");
var shell = require("gulp-shell");
var typedoc = require("gulp-typedoc");
var reporters = require("jasmine-reporters");
var Reporter = require("jasmine-terminal-reporter");

gulp.task("clean", function(cb) { del(["lib", "spec/build"], cb); });

gulp.task("clean:typings", function (cb) { del(["typings", "spec/typings"], cb); });

gulp.task("install:typings", ["install:typings:src", "install:typings:spec"]);

gulp.task("install:typings:src", shell.task("typings install"));

gulp.task("install:typings:spec", shell.task("typings install", { cwd: "spec/" }));

gulp.task("compile", shell.task("tsc -p ./"));

gulp.task("compile:spec",　["install:typings:spec"], shell.task("tsc", {cwd: "spec/"}));

gulp.task("test", ["compile:spec"], function(cb) {
	var jasmineReporters = [ new Reporter({
			isVerbose: false,
			showColors: true,
			includeStackTrace: true
		}),
		new reporters.JUnitXmlReporter()
	];
	gulp.src(["lib/Timeline.js", "lib/Tween.js"])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on("finish", function() {
			gulp.src("spec/build/**/*[sS]pec.js")
				.pipe(jasmine({reporter: jasmineReporters}))
				.pipe(istanbul.writeReports({ reporters: ["text", "cobertura", "lcov"] }))
				.on("end", cb);
		});
});

gulp.task("default", ["compile"]);
