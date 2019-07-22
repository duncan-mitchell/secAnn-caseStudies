const EventEmitter = require('events');
class NetEmitter extends EventEmitter {};

const serverEmitter = new NetEmitter();

function createServer() {
	return {
		init:true,
		listening:false,
		address:undefined,
		port:undefined,
		listen: function(port, host, cb) {
			this.listening=true;
			this.address=host;
			this.port=port;
			cb();
		},
		on: function(type, cb) {
			if (type == 'connection') {
				this.clientConnected = true;
				serverEmitter.on('connection', (socket) => {cb(socket)});
			}
		},
		close: function() {
			serverEmitter.removeAllListeners();
			this.listening=false;
			this.init=false;
			this.address=undefined;
			this.port=undefined;
		}
	}
}

class Socket extends EventEmitter {
	constructor() {
		super();
	}
	connect(port, host, cb) {
		this.connected=true;
		this.remoteAddress=host;
		this.remotePort=port;
		this.localAddress=host; //for mocking purposes
		this.localPort='2222'; //for mocking purposes
		//construct new socket for the server
		this.remoteEmitter = new Socket();
		this.remoteEmitter.localAddress=host;
		this.remoteEmitter.localPort=port;
		this.remoteEmitter.remotePort=this.localPort;
		this.remoteEmitter.remoteAddress=this.localAddress;
		this.remoteEmitter.remoteEmitter=this;
		serverEmitter.emit('connection', this.remoteEmitter);
		cb();
	}
	destroy() {
		this.emit('close');
		this.removeAllListeners();
		this.remoteEmitter.emit('close');
		this.remoteEmitter.removeAllListeners();
	}
	write(str, enc) {
		this.remoteEmitter.emit('data', str);
	}
};


module.exports = {
	createServer: createServer,
	Socket: Socket
}