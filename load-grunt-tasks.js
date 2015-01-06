'use strict';

var path = require('path');
var findup = require('findup-sync');
var multimatch = require('multimatch');

function arrayify(el) {
	return Array.isArray(el) ? el : [el];
}


module.exports = function (grunt, options) {
	options = options || {};

	var pattern = arrayify(options.pattern || ['grunt-*']);
	var config = options.config || findup('package.json');
	var scope = arrayify(options.scope || ['dependencies', 'devDependencies', 'peerDependencies']);
	var modules_dir = options.modulesDir || 'node_modules';

	if (typeof config === 'string') {
		config = require(path.resolve(config));
	}

	pattern.push('!grunt', '!grunt-cli');

	var names = scope.reduce(function (result, prop) {
		return result.concat(Object.keys(config[prop] || {}));
	}, []);

	multimatch(names, pattern).forEach(function(name){
		var taskName = name.replace('grunt-contrib-', '').replace('grunt-', '');
		var modulePath = findup(path.join('node_modules', name, 'tasks', '{' + taskName + ',' + name + '}')+'.{js,coffee}');
		if (modulePath) {
			require(modulePath)(grunt);
		} else {
			grunt.log.writeln(('Couldn\'t find path to ' + name).yellow);
			grunt.log.writeln('You may need to load it manually.'.yellow);
		}
	});
};
