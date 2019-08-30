'use strict';

var store = {
	notes1: undefined,
	notes2: undefined,
	notes2_hash: undefined,
	notes3: undefined,
	notes3_mac: undefined,
	salt3: undefined,
	notes4: undefined,
	nonce4: undefined,
	salt4: undefined
}

function getItem(key) {
	let promise = new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve(key);
		}, 300);
	});
	return promise.then(function(res) {
		return store[key]
	});
}

function setItem(key, val) {
	let promise = new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve(val);
		}, 300);
	});
	return promise.then(function(res) {
		store[key] = val;
		return store[key];
	});
}

module.exports = {
	getItem: getItem,
	setItem: setItem
}