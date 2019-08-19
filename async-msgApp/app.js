/*
 * Client-Server Crypto Messaging Application.
 *
 * The case study in our ESORICS'19 Paper, adapted to include:
 * -> A proper mock for net using events
 * -> Still a toy mock for webcrypto, to avoid computing crypto.
 *
 * Added symbolic array for input to enable DSE through expoSE.
 */
'use strict';
var window = require('./window-mock');
var net = require('./net-mock');

/**
 * START OF REQUIRED DEVELOPER MODIFICATIONS
 * Addin the shim, call it and mock process.argv as a symbolic array.
 */
var S$ = require('S$');
var shim = require('./wcShim');
shim(window);
process.argv = S$.symbol('Args', ['']);
/**
 * END OF REQUIRED DEVELOPER MODIFICATIONS
 */

//Initialize crypto.
var crypto = window.crypto;

//Server Code
var host = '127.0.0.1';
var port = 3000;
var aliceStore = {
	server:true,
	name: "Alice",
	supported: "AES",
	keyExchAlg: "ECDH",
	generator: new Uint8Array([5]),
	prime: new Uint8Array([23]),
	keyPair: undefined,
	sharedSecret: undefined
}

//Initialize Server
var server = net.createServer();
derivePubPrivKeyPair(aliceStore);

//Start Listening
server.listen(port, host, function() {
	console.log("Server Listening: " + host + ":" + port);
});

//Main Server Logic
server.on('connection', function(socket) {
	socket.on('data', function(data) {
		onData(data, socket);
	});
	socket.on('close', function() {
		console.log("Client Closed: " + socket.remoteAddress + ":" + socket.remotePort);
	});
	onConnect(socket);
});

//Logic for handling incoming data
function onData(data, socket) {
	var str = data.toString('utf8')
	console.log("Received from " + socket.remoteAddress + ":" + socket.remotePort + ": " + str);
	//check if message is a public key or a ciphertext
	var pubKeyGuard = str.match(/{publicKey:(.*?)}/);
	var ctGuard = str.match(/{ct:(.*),iv:(.*)}/);
	if (pubKeyGuard != null) {
		importKey(aliceStore, pubKeyGuard[1]).then(function(theirPubKey) {
			aliceStore.keyPair.then(function(keyPair) {
				computeSharedSecret(aliceStore, theirPubKey, keyPair.privateKey);
				aliceStore.sharedSecret.then(function(){
					sendMsg(socket, "ACK PubKey", aliceStore.name);
				}).catch(cbErr);
			}).catch(cbErr);
		}).catch(cbErr);
	} else if (ctGuard != null) {
		decrypt(aliceStore, ctGuard[1], ctGuard[2]).then(function(decrypted) {
			if(decrypted != null) {
				console.log('Server has decrypted the message: ' + decrypted);
			} else {
				console.log('Server has failed to decrypt the message.');
			}
			finished(socket);			
		}).catch(cbErr);
	} else {
		console.log('Server does not recognize the message.')		
		finished(socket);
	}
}

//On a Client Connecting, report the address and give out cryptoParams
function onConnect(socket) {
	console.log("Client Connected: " + socket.remoteAddress + ":" + socket.remotePort);
	aliceStore.keyPair.then(function(val) {
		var strPubKey = val.publicKey.toString('utf8');		
		var alg = '{name:ECDH,prime:' + aliceStore.prime + ',generator:' + aliceStore.generator + ',public:' + strPubKey + '}';
		sendMsg(socket, "Hello, client. " + 
						"Supported Encryption:" + aliceStore.supported + '; KeyExchange:' + alg,
						aliceStore.name);
	}).catch(cbErr);
}

//Client Code
var client = new net.Socket();
var host = '127.0.0.1'
var port = 3000;
var bobStore = {
	server:false,
	name: "Bob",
	keyPair: undefined,
	sharedSecret: undefined,
	generator:undefined,
	prime:undefined,
	keyExchAlg:undefined
}
client.on('close', function() {
	console.log('Connection Closed to ' + host + ":" + port + '.');
});
client.on('data', function(data) {
	var str = data.toString('utf8');
	console.log('Received from ' + host + ':' + port + ': ' + str);
	if (/Supported Encryption:/.test(str)) {
		if(/none/.test(str)) {
			sendMsg(client, getMsg, bobStore.name);
		} else if (/AES/.test(str)) {
			processParams(bobStore, str).then(function(theirPubKey) {
				derivePubPrivKeyPair(bobStore);
				bobStore.keyPair.then(function(val) {
					var strPubKey = val.publicKey;
					var myPrivKey = val.privateKey;		
					computeSharedSecret(bobStore, theirPubKey, myPrivKey);
					bobStore.sharedSecret.then(function() {
						sendMsg(client, 
							"Hi, my public key is {publicKey:" + strPubKey + "}",
							bobStore.name)					
					}).catch(cbErr);
				}).catch(cbErr);
			}).catch(cbErr);
		} else {
			throw 'No supplied encryption methods.'
		}
	} else if (/ACK/.test(str)) {
		var msg = getMsg();
		encrypt(bobStore, msg).then(function(ct) {
			sendMsg(client, ct, bobStore.name)
		}).catch(cbErr);
	}
});
client.connect(port, host, function() {
	console.log("Connected to " + host + ":" + port + '.');
});


//Auxilliary Functions
function finished(socket) {
	socket.destroy();
	server.close();
}

function importKey(store, pubKey) {
	return crypto.subtle.importKey("raw", pubKey, {name:store.keyExchAlg, prime:store.prime, generator:store.generator}, false, []);
}

function processParams(store, str) {
	var re = /KeyExchange:{name:(.*),prime:(.*),generator:(.*),public:(.*)}/;
	var params = str.match(re)
	if (params == null) { throw "invalid KeyExchange Parameters"}
	store.keyExchAlg = params[1];
	store.prime = new Uint8Array([parseInt(params[2])]);
	store.generator = new Uint8Array([parseInt(params[3])]);
	//return the imported public key
	return importKey(store, params[4]);
}

function derivePubPrivKeyPair(store) {
	store.keyPair = crypto.subtle.generateKey({
		name: store.keyExchAlg,
		prime: store.prime,
		generator: store.generator
	}, false, "deriveKey")
}

function computeSharedSecret(store, theirPubKey, myPrivKey) {
	store.sharedSecret = crypto.subtle.deriveKey({
		name: store.keyExchAlg,
		prime: store.prime,
		generator: store.generator,
		public: theirPubKey
	},
	myPrivKey,
	{name:"AES-CBC", length:128},
	false,
	["encrypt", "decrypt"]);
}

/**
 * Location of bug
 */
function getIV() {
	var iv = new Uint8Array(16);
	crypto.getRandomValues(iv);
	//IV should be encodable as ASCII characters
	//Comment out for loop to avoid bug
	for (var i = 0; i < iv.length; i++) {
		iv[i] = iv[i] % 128;
	}
	return iv;
}

function encrypt(store, str) {
	var ivEnc = getIV();
	var ct = store.sharedSecret.then(function(secret) {
		return crypto.subtle.encrypt({
			name:'AES-CBC',
			length:128,
			iv: ivEnc,
		}, secret, str)
	}).catch(cbErr);
	var res = ct.then(function(res) {
		return "{ct:"+res[0]+",iv:"+res[1]+"}";
	}).catch(cbErr);
	return res;
}

function decrypt(store, str, iv) {
	var pt = store.sharedSecret.then(function(secret) {
		return crypto.subtle.decrypt({
			name:'AES-CBC',
			length:128,
			iv: iv
		}, secret, str);
	}).catch(cbErr);
	return pt;
}

function sendMsg(socket, msg, usr) {
	var final = usr + " > " + msg;
	socket.write(final, 'utf8');
	console.log("Sent to " + socket.remoteAddress + ":" + socket.remotePort + ': ' + final);
}

function getMsg () {
	var args = process.argv;
	if (args.length != 3) {
		throw ("cryptoApp takes a single message as argument");
	} else {
		return args[2];
	}
}

//We could remove the throw to avoid crashing the application if we wanted.
function cbErr(e) {
	console.log('Terminating Application due to: ' + e);
	throw e;
}