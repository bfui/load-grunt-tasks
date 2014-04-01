'use strict';
var path = require('path');
var findup = require('findup-sync');
var multimatch = require('multimatch');
var fs = require('fs');

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
		var moduleBasePath = path.resolve('../', name);
		if ( !fs.existsSync(moduleBasePath) ) {
			moduleBasePath = path.resolve(modules_dir, name);
		}
		var modulePath = path.join(moduleBasePath, 'tasks', taskName);
		require(modulePath)(grunt);
	});
};