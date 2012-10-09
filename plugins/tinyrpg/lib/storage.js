var fs = require('fs');

function readFileJSON(filename, _cb) {
		fs.readFile(filename, function(e, d) {
			if (e) return _cb(e);
			_cb(null, JSON.parse(d.toString()));
		});
}

function writeFileJSON(filename, data, _cb) {
	fs.open(filename, 'w', 0666, function(err, d) {
		if(err) return _cb(err);
		
		fs.write(d, JSON.stringify(data), null, undefined, function(err, written) {
			if(err) return _cb(err);
			
			_cb(null, written);
		});
	});
}

function dir(path, _cb) {
	fs.readdir(__dirname + path, function(err, files) {
		if(err) return _cb(err);
		
		_cb(null, files);
	});
}

exports.readFileJSON = readFileJSON;
exports.writeFileJSON = writeFileJSON;
exports.dir = dir;