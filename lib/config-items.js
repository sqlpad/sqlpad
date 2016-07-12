var fs = require('fs');
var toml = require('toml');
var tomlFile = fs.readFileSync(__dirname + "/config-items.toml", {encoding: 'utf8'});
var parsedToml = toml.parse(tomlFile);
var configItems = parsedToml.configItems;
module.exports = configItems;