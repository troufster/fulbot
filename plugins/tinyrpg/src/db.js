var storage = require('../lib/storage');
var prefix = "./resources/tinyrpg/";

function getPlayerFile(name, _cb) {
	var filename = prefix + name + '.player';
	
	storage.readFileJSON(filename, function(err, data) {
		if(err) return _cb(err);
		
		_cb(null, data);
	});
}

function writePlayerFile(name, data, _cb) {
	var filename = prefix + name + '.player';



	storage.writeFileJSON(filename, data, function(err, d) {
		if(err) return _cb(err);
		
		_cb(null, d);
	});
}

function getPlayerFiles(_cb) {
	storage.dir('/../../../resources/tinyrpg/', function(err, files) {
		if(err) return _cb(err);
		
		var ret = [];
		
		for(var i = 0, l = files.length; i < l; i++) {
			if(files[i].indexOf('.player') > -1) {
				ret.push(files[i]);
			}
		}
		
		_cb(null, ret);
	});
}

exports.writePlayerFile = writePlayerFile;
exports.getPlayerFile = getPlayerFile;
exports.getPlayerFiles = getPlayerFiles;