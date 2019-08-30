const page = require('./page-mock')

var document = {
	getElementById: function(id) {
		id = id.replace(/\-/, "");
		if (page[id]) {
			return page[id]
		} else {
			throw ('No such element' + id)
		}
	}
}

module.exports = document;