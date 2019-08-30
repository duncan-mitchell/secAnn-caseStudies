const eventTarget = require('./eventTarget-mock');

class MyElement {
	insertAdjacentHTML(place, tag) {
		return true;
	}
}

passwordEmitter = new eventTarget.MyEmitter();
passwordEmitter.value = "";

fileEmitter = new eventTarget.MyEmitter();
fileEmitter.value = "";
fileEmitter.files = [];

var elements = {
	customFile: fileEmitter,
	generateButton: new eventTarget.MyEmitter(),
	inputPassword: passwordEmitter,
	encryptBtn: new eventTarget.MyEmitter(),
	decryptBtn: new eventTarget.MyEmitter(),
	resetBtn: new eventTarget.MyEmitter(),
	error: new MyElement(),
	strengthmeter: {
		innerHTML: undefined,
		style: {
			width: undefined,
		}
	},
	strengthtext: {
		innerHTML: undefined
	},
	fileplaceholder: {
		innerHTML: undefined
	},
	results: new MyElement(),
}

module.exports = elements;