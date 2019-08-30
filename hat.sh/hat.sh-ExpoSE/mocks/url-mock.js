//string to array buffer from WebCrypto documentation
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, buf);
}

var url = {
	createObjectURL: function(blob) {
		if (blob[0] && typeof blob[0] === "string") {
			let buf0 = new Uint8Array(str2ab(blob[0]));
			let buf1 = blob[1];
			let buf2 = blob[2];
			let bufLen = buf0.length + buf1.length + buf2.length;
			let buf3 = new Uint8Array(bufLen);
			buf3.set(buf0, 0);
			buf3.set(buf1, buf0.length);
			buf3.set(buf2, buf1.length+buf0.length);
			this.savedURL = buf3;
			return buf3
		} else {
			this.savedURL = ab2str(blob[0]);
			return this.savedURL;
		}
	},
	savedURL: undefined,
}

module.exports = url;