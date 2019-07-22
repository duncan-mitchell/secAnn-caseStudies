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
					return {
						alg: alg,
						extractable: extractable,
						keyUsages: keyUsages,
						publicKey: pub,
						privateKey: priv,
					}
				}
				throw "invalid key generation"
			},
			encrypt: function(alg, key, data) {
				if(alg.name == 'AES-CBC') {
				 	return ['ciphertext', alg.iv.toString()]; //changed from data
				} else {
					throw 'invalid algorithm'
				}
			},
			decrypt: function(alg, key, data) {
				if(alg.name == 'AES-CBC') {
					return 'decrypted ciphertext'; //changed from data
				} else {
					throw 'invalid algorithm'
				}
			},
			sign: function(alg, key, data){
				return 'signature'; //changed from data
			},
			deriveKey: function(alg, masterKey, derivedKeyAlgorithm, extractable, keyUsages) {
				return {
					alg: derivedKeyAlgorithm,
					key: "shared key",
					keyUsages: keyUsages,
					extractable: extractable
				}
			},
			importKey: function(type, key, alg, extractable, keyUsages) {
				return {
					alg: alg,
					key: key,
					keyUsages: keyUsages,
					extractable: extractable
				}
			}
		}
	}
}

module.exports = window;