//string to array buffer from WebCrypto documentation
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


class FileReader {	
	constructor() {
		this.result = 'default'
	}
	readAsArrayBuffer(file) {
		this.onloadstart();
		let p = new Promise(function(resolve, reject) {
			setTimeout(function() {
				resolve(file);
			}, 300);
		}); 
		p.then((res) => {
			this.result = (typeof res === 'string') ? str2ab(res) : res;
			this.onload();
		});
	}
}

module.exports = FileReader