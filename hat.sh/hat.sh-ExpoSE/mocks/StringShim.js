const S$ = require('S$');


/**
 * Shim for Strings to propagate annotaitons
 */
var stringShim = function(string) {

	var f = String.fromCharCode.bind(null);
	var fromCharCodeShim = function(x, y) {
		return S$.cpAnn(y, f.apply(x, y));
	}

	Object.defineProperty(String.fromCharCode, 
		                  'apply',
		                  {value: fromCharCodeShim});
}

module.exports = stringShim;

