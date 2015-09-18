var fs = require('fs-extra');

var templates = {
	
	directory: undefined,
	
	templateContent: function (templateName) {
		var filename = templateName.replace(/.ejs/i, ''); // just in case .ejs is passed in.
		var contents = fs.readFileSync(templates.directory + '/' + filename + '.ejs', 'utf8');
		//console.log(filename);
		//console.log(templates.directory + filename + '.ejs');
		return contents;
	}
	
};

module.exports = templates;