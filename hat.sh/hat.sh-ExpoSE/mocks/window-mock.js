/*
 * Mock for WebCrypto
 */
var window = {
	setTimeout: function(f, t) {
		console.log('timeout called')
	},
	atob: function(x) {
		return (Buffer.from(x, 'base64').toString())
	},
	crypto: {
		getRandomValues: function(array) {
			for (var i = 0; i < array.length; i++) {
				array[i] = 1;
			}
			return array; //turns out it returns array contrary to spec
		},
		subtle: {
			generateKey: function(alg, extractable, keyUsages){
				if (alg.name == "ECDH") {
					var pub = "public key";
					var priv = "private key";
					var res = {
						alg: alg,
						extractable: extractable,
						keyUsages: keyUsages,
						publicKey: pub,
						privateKey: priv,
					}
					return new Promise(function(resolve, reject) {
						setTimeout(function() {
				    		resolve(res);
				  		}, 300);
					}); 
				}
				throw "InvalidAccessError"
			},
			encrypt: function(alg, key, data) {
				if(alg.name == 'AES-CBC' || alg.name == 'AES-GCM') {
				 	var res = data;
					return new Promise(function(resolve, reject) {
						setTimeout(function() {
				    		resolve(res);
				  		}, 300);
					}); 				 	
				} else {
					throw 'InvalidAccessError'
				}
			},
			decrypt: function(alg, key, data) {
				if(alg.name == 'AES-CBC' || alg.name == 'AES-GCM') {
					var res = data;
					return new Promise(function(resolve, reject) {
						setTimeout(function() {
				    		resolve(res);
				  		}, 300);
				  	});
				} else {
					throw 'InvalidAccessError'
				}
			},
			sign: function(alg, key, data){
				var res = data; //changed from data
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
			    		resolve(res);
			  		}, 300);
			  	});
			},
			deriveKey: function(alg, masterKey, derivedKeyAlgorithm, extractable, keyUsages) {
				var res = {
					alg: derivedKeyAlgorithm,
					key: "shared key",
					keyUsages: keyUsages,
					extractable: extractable
				}
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
			    		resolve(res);
			  		}, 300);
			  	});
			},
			importKey: function(type, key, alg, extractable, keyUsages) {
				var res = {
					alg: alg,
					key: key,
					keyUsages: keyUsages,
					extractable: extractable
				}
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
			    		resolve(res);
			  		}, 300);
			  	});
			},
			digest: function(alg, data){
				var res = data; //changed from data
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
			    		resolve(res);
			  		}, 300);
			  	});
			},
			verify: function(alg, key, sig, data){
				var res = (data===sig); //changed from data
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
			    		resolve(res);
			  		}, 300);
			  	});
			},	
		}
	}
}

module.exports = window;