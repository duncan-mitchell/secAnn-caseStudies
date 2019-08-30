const EventEmitter = require('events');

class Emitter extends EventEmitter {
	constructor() {
		super();
	}
	addEventListener(action, cb, options) {
		this.on(action, cb);
	}
	click() {
		this.emit("click");
	}
	input(data) {
		this.value = data;
		this.emit("input");
	}
	change(data) {
		this.value = true;
		this.files = [data];
		this.emit("change");
	}
}

module.exports = {
	MyEmitter: Emitter
}