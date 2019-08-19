/*
 * Mock for WebCrypto
 */
var window = {
	crypto: {
		getRandomValues: function(array) {
			for (var i = 0; i < array.length; i++) {
				array[i] = 1;
			}
			return null;
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
				throw "invalid key generation"
			},
			encrypt: function(alg, key, data) {
				if(alg.name == 'AES-CBC') {
				 	var res = ['ciphertext', alg.iv.toString()];
					return new Promise(function(resolve, reject) {
						setTimeout(function() {
				    		resolve(res);
				  		}, 300);
					}); 				 	
				} else {
					throw 'invalid algorithm'
				}
			},
			decrypt: function(alg, key, data) {
				if(alg.name == 'AES-CBC') {
					var res = 'decrypted ciphertext';
					return new Promise(function(resolve, reject) {
						setTimeout(function() {
				    		resolve(res);
				  		}, 300);
				  	});
				} else {
					throw 'invalid algorithm'
				}
			},
			sign: function(alg, key, data){
				var res = 'signature'; //changed from data
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
			}
		}
	}
}

module.exports = window;