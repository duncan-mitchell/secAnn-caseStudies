'use strict'
var window = require('./mocks/window-mock');
var crypto = window.crypto;
var shim = require('./mocks/wcShim');
shim(window);

//var S$ = require('S$');
process.argv = ["driver.js", "a note", "a password"];//S$.symbol('Args', ['']);

function getNote () {
	var args = process.argv;
	if (args.length < 2 || args[1] === "") {
		throw ("secret-notes requires a note as the first argument");
	} else {
		return args[1];
	}
}

var plain = require('./versions/plain');
var v1 = plain.save(getNote()).then(function() {
	plain.load().then(function(res) {
		console.log('plain: ' + res);
	})
});

var integrity = require('./versions/integrity');
var v2 = integrity.save(getNote()).then(function() {
	integrity.load().then(function(res) {
		console.log('integrity: ' + res);
	})
});

var authenticity = require('./versions/authenticity');
var v3 = authenticity.save(getNote()).then(function() {
	authenticity.load().then(function(res) {
		console.log('authenticity: ' + res);
	})
});

var secrecy = require('./versions/secrecy');
var v4 = authenticity.save(getNote()).then(function() {
	authenticity.load().then(function(res) {
		console.log('secrecy: ' + res);
	})
});
