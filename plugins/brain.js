var fs = require('fs');

function trimstr(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

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

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

function filterMessage(message, bot) {
	message = message.toLowerCase();
	
	//remove garbage
	message = message.replace('\"', '');
	message = message.replace("'", '');
	message = message.replace('\n', '');
	message = message.replace('\r', '');
	
	//Remove matching braces
	//Unmatched would be a smiley
	var index = 0;
	
	while (true){
		
		if(index >= message.length) break;
		index = message.indexOf("(", index);
		var i = message.indexOf(")", index+1);
		if(index <=0) break;
		
		message = setCharAt(message, index, "");
		message = setCharAt(message, i-1, "");
		
		index=0;
	}
	
	//Remove URLs	
	message = message.replace(/https?:\/\/[^ ]*/g, "");
	
	//Normalize semicolons
	message = message.replace("; ", ", ");
	
	return message;
}

function MarkovBrain() {	
	this._root = {};
	this.learning = false;
	
	this.noendwords = ['att'];
}

MarkovBrain.rnd = function(ceil) {
	return ~~(Math.random()*ceil);
};


MarkovBrain.prototype.random = function() {
	var roots = Object.keys(this._root);	
	var r = MarkovBrain.rnd(roots.length);	
	var rr = roots[r].split(' ');
	
	return [rr[0], rr[1], this._root[roots[r]][MarkovBrain.rnd(this._root[roots[r]].length)]];
};

MarkovBrain.prototype.reply = function(source, depth) {	var reply = [];
		
	//Try to choose a word pair from the source
	var randomly
	var asource = source.split(' ');
		
	var rsource = MarkovBrain.rnd(asource.length);
	if(rsource >= asource.length-1) rsource = asource.length-2;		
	var rpick = asource[rsource] + ' ' + asource[rsource+1];
	rpick = rpick.toLowerCase();	
		
	if(this._root.hasOwnProperty(rpick)) {
		//Pick based on source
		randomly = [asource[rsource], asource[rsource+1], this._root[rpick][MarkovBrain.rnd(this._root[rpick].length)]];
	} else {		
		//Pick randomly
		randomly = this.random();	
	}
	
	reply.push(randomly[0]);
	reply.push(randomly[1]);
	reply.push(randomly[2]);
	var next;
	
	for(var i = 0; i < depth; i++){
		next = randomly[1] + ' ' + randomly[2];
	
		if(this._root.hasOwnProperty(next)) {
			var val = this._root[next][MarkovBrain.rnd(this._root[next.length])];
			
			reply.push(val);
			randomly = ['', randomly[2], val];
			continue;
		} else {
			randomly = this.random();
			reply.push(randomly[0]);
			reply.push(randomly[1]);
			reply.push(randomly[2]);
		}
	}
		
	var retval = reply.join(" ") + ".";
	
	//Trim whitespace
	retval = trimstr(retval);
	
	//Capitalize first letter
	retval = retval.charAt(0).toUpperCase() + retval.slice(1);

	//Remove double whitespaces
	retval = retval.replace(/\s+/g, ' ');
		
	return retval;
};

MarkovBrain.prototype.learn = function(data) {
	var words = data.split(' ');
	var limit = words.length-2;
	var i = 0;
	
	while(i < limit) {
		var first = words[i];
		var second = words[i+1];
		var value = words[i+2];
		
		var segment = first + ' ' + second;
		
		if(!this._root.hasOwnProperty(segment)) {
			this._root[segment] = [];
		}
		
		this._root[segment].push(value);
		
		i++;
	}			
};

var s = new MarkovBrain();


readFileJSON('./resources/brain/brain.json', function(e, d) {
	if(e) throw e;
	s._root = d;
	dosave();
});


//Brain save
function dosave() {
setInterval(function() {
	writeFileJSON('./resources/brain/brain.json', s._root, function(e,d) {
		if(e) {
			return console.log("Could not save brain :( :" + e);
		}
		console.log("Brain saved...");
	});
}, 300000);
}


function brain(bot, from, to, message) { 
  var parts = message.split(" ");
       
  var command = parts[1];
  
	switch(command) {
		case "stats":
			var cells = Object.keys(s._root).length;
			var d = cells + " roots in my brain, sir.\nUsing " + process.memoryUsage().rss + " bytes of sweet, juicy memory\n" ;
			d += "Learning state : " + s.learning.toString();
	
			bot.say(to, d);    
			break;	 
		case "learn":			
			s.learning = !s.learning;
			
			bot.say(to, "Learning state is now : " + s.learning);
			break;
		case "random":
			bot.say(to, s.reply("", MarkovBrain.rnd(10)));
			break;
	}
		
};

function spam(bot, from, to, message) { 	
	if(s.learning) {
		message = filterMessage(message);
			
		if(message.indexOf(bot.nick.toLowerCase()) == -1) {
			s.learn(message);
		}
	}		
		
	
	//U talking shit about me bish?
	if(message.toLowerCase().indexOf(bot.nick.toLowerCase()) > -1) {
		bot.say(to, s.reply(message, MarkovBrain.rnd(10)));
	}
};
exports.listeners = function (){ return [{
    name : "!brain listener",
    match : /^!brain/i,
    func : brain,
    listen : ["#sogeti","#games","#botdev", "priv"]
  },{
    name : "spam listener",
    match : /(.*)/i,
    func : spam,
    listen : ["#sogeti","#games","#botdev", "priv"]
  }];
  
};




