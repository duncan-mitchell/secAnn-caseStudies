const S$ = require('S$');

/*
 * SecAnn <!CSRV * Message * CryptKey * Signature!>;
 * SecAnn <!PrivKey * PubKey * SymKey!> Extends <!CryptKey!>;
 * SecAnn <!Plaintext * Ciphertext!> Extends <!Message!>;
 */
var _CSRV       = S$.SecAnn("CSRV");
var _MESSAGE    = S$.SecAnn("Message");
var _CRYPTKEY   = S$.SecAnn("CryptKey");
var _SIGNATURE  = S$.SecAnn("Signature");
var _PRIVKEY    = S$.SecAnn("PrivKey", _CRYPTKEY);
var _PUBKEY     = S$.SecAnn("PubKey", _CRYPTKEY);
var _SYMKEY     = S$.SecAnn("SymKey", _CRYPTKEY);
var _PLAINTEXT  = S$.SecAnn("Plaintext", _MESSAGE);
var _CIPHERTEXT = S$.SecAnn("Ciphertext", _MESSAGE);
var _HASH     = S$.SecAnn("Hash")
_CSRV       = new _CSRV([]);
_MESSAGE    = new _MESSAGE([]);
_CRYPTKEY   = new _CRYPTKEY([]);
_SIGNATURE  = new _SIGNATURE([]);
_PRIVKEY    = new _PRIVKEY([]);
_PUBKEY     = new _PUBKEY([]);
_SYMKEY     = new _SYMKEY([]);
_PLAINTEXT  = new _PLAINTEXT([]);
_CIPHERTEXT = new _CIPHERTEXT([]);
_HASH       = new _HASH([]);

/**
 * Creates a clone of the object and returns it
 */
function clone(obj) {
	var copy = {};
	if (null == obj || "object" != typeof obj) { return obj; }
	Object.getOwnPropertyNames(obj).forEach(function (attr) {
        if (obj.hasOwnProperty(attr)) {
        	copy[attr] = clone(obj[attr]);
        }
	});
    return copy;
}

/**
 * Shim for webcrypto, from ESORICS'19
 */
var wcShim = function(window) {

	//Store actual WebCrypto implementation safely
	window.oldCrypto = clone(window.crypto);
	var wc = window.oldCrypto.subtle;

	var grvShim = function(arr) {
	  window.oldCrypto.getRandomValues(arr);
	  arr = S$.annotate(arr, _CSRV);
	  return arr;
	};

	var gkShim = function(alg, extractable, keyUsages) {
	  var res = wc.generateKey(alg, extractable, keyUsages);
	  res = res.then(function(key) {
	  	if (/RSA|ECD/.test(alg.name)) {
		    key.privateKey = S$.annotate(S$.annotate(key.privateKey, _PRIVKEY), _CSRV);
		    key.publicKey  = S$.annotate(S$.annotate(key.publicKey, _PUBKEY), _CSRV);
		    return key;
		  } else if(/AES|HMAC/.test(alg.name)) {
		    return S$.annotate(S$.annotate(key, _SYMKEY), _CSRV);
		  } else { throw FailedSecurityCheck; }
	  });
	  return res;
	};
	
	var dkShim = function(alg,
		                  masterKey,
		                  derivedKeyAlg, 
		                  extractable,
		                  keyUsages) {
	  if (alg.name === 'ECDH') {
		  S$.enforce(alg['public'], _PUBKEY);
		  S$.enforce(masterKey, _PRIVKEY);
		  let res = wc.deriveKey(alg, masterKey, derivedKeyAlg, extractable, 
		    keyUsages);
		  res = res.then(function(key) {
			  return S$.annotate(key, _SYMKEY);
		  });
		  return res;
	  } else if (alg.name === 'HKDF' || alg.name === 'PBKDF2') {
	  	  if (alg.hash === 'SHA-1') { 
	  	  	throw 'FailedSecurityCheck';
	  	  }
		  S$.enforce(masterKey, _PUBKEY);
		  S$.enforce(alg['salt'], _CSRV);
		  let res = wc.deriveKey(alg, masterKey, derivedKeyAlg, extractable, 
		    keyUsages);
		  res = res.then(function(key) {
			  return S$.annotate(key, _SYMKEY);
		  });
		  return res;

	  } else {
	  	throw FailedSecurityCheck;
	  }
	};
	
	var encShim = function(alg,
	                       key,
	                       data) {
	  S$.enforce(alg['iv'], _CSRV);
	  if (/AES/.test(alg.name)) {
	    S$.enforce(key, _SYMKEY);
	  } else if (/RSA/.test(alg.name)) {
	    S$.enforce(key, _PUBKEY);
	  } else { throw FailedSecurityCheck; }
	  var res = window.oldCrypto.subtle.encrypt(alg, key, data);
	  res = res.then(function(val) {
		  return S$.annotate(S$.drop(S$.cpAnn(data, val), _PLAINTEXT), _CIPHERTEXT);
	  });
	  return res;
	};
	
	var decShim = function(alg, key, data) {
	  if (/AES/.test(alg.name)) {
	    S$.enforce(key, _SYMKEY);
	  } else if (/RSA/.test(alg.name)) {
	    S$.enforce(key, _PRIVKEY);
	  } else { throw FailedSecurityCheck; }
	  var res = wc.decrypt(alg, key, data);
	  res = res.then(function(val) {
	  	return S$.annotate(S$.drop(S$.cpAnn(data, val), _CIPHERTEXT), _PLAINTEXT);
	  });
	  return res;
	};
	
	//should change this a little
	var ikShim = function(type, key, alg, extractable, keyUsages) {
	  var res = wc.importKey(type, key, alg, extractable, keyUsages);
	  res = res.then(function(key) {
	  	return S$.annotate(key, _PUBKEY);;
	  });
	  return res;
	};
	
	var sigShim = function(alg, key, data) {
	 //S$.enforce(data, _CIPHERTEXT)
	  if (/HMAC/.test(alg.name)) {
	  	S$.enforce(key, _SYMKEY);
	  } else if (/RSA|ECDSA/.test(alg.name)) {
	  	S$.enforce(key, _PRIVKEY);
	  }
	  var res = wc.sign(alg, key, data);
	  res = res.then(function(sig) {
		return S$.annotate(S$.annotate(sig, _SIGNATURE), _HASH);
	  });
	  return res;
	}

	var verifyShim = function(alg, key, sig, data) {
	  S$.enforce(sig, _SIGNATURE);
	  if (/HMAC/.test(alg.name)) {
	  	S$.enforce(key, _SYMKEY);
	  } else if (/RSA|ECDSA/.test(alg.name)) {
	  	S$.enforce(key, _PRIVKEY);
	  }
	  var res = wc.verify(alg, key, sig, data);
	  res = res.then(function(val) {
		return val;
	  });
	  return res;
	}

	var digestShim = function(alg, data) {
	  if (alg.name === "SHA-256" || alg.name === "SHA-384" || alg.name === "SHA-512") {
	  	var res = wc.digest(alg, data);
	  	res = res.then(function(sig) {
			return S$.annotate(sig, _HASH);
	  	});
	  	return res;
	  } else {
		throw "FailedSecurityCheck";	  	
	  }
	}

	
	var wcShim = { generateKey: gkShim, deriveKey: dkShim,
	  encrypt: encShim, decrypt: decShim, importKey: ikShim, sign: sigShim, digest: digestShim, verify: verifyShim};
	Object.defineProperty(window.crypto, "subtle", {value: wcShim});
	Object.defineProperty(window.crypto, "getRandomValues", {value: grvShim});
}

module.exports = wcShim;

