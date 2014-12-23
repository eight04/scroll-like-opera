/* eslint strict: 0 */

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bump: {
			version: {
				options: {
					files: ["bower.json", "package.json", "scroll-like-opera.user.js"],
					commitFiles: ["-A"]
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-bump');

	// Tasks
	grunt.registerTask('build', ["bump"]);
};
