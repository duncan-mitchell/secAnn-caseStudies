function prompt(arg) {
	var args = process.argv;
	if (args.length < 3 || args[2] === "") {
		throw ("secret-notes requires a password as the second argument");
	} else {
		return args[2];
	}
}

module.exports = prompt;