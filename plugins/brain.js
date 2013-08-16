'use strict';

var fs = require('fs');

function trimstr(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function readFileJSON(filename, _cb) {
		fs.readFile(filename, function(e, d) {
			if (e) {
        return _cb(e);
      }
			return _cb(null, JSON.parse(d.toString()));
		});
}

function writeFileJSON(filename, data, _cb) {
	fs.open(filename, 'w', 0x0666, function(err, d) {
		if(err) {
    			return _cb(err);
		}
    		

		return fs.write(d, JSON.stringify(data), null, undefined, function(err, written) {
			if(err) {
        			return _cb(err);
			}
			
			fs.close(d,function(){      				
      				return _cb(null, written);
    			});
			
		});
	});
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) {
      return str;
    }
    return str.substr(0,index) + chr + str.substr(index+1);
}

function filterMessage(message, bot) {
  message = message.toLowerCase();

  //remove garbage
  message = message.replace(/\"/g, "");
  message = message.replace(/'/g, "");
  message = message.replace('\n', '');
  message = message.replace('\r', '');
  //"""
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

  //Trim whitespace
  message = trimstr(message);

  //Remove double whitespaces
  message = message.replace(/\s+/g, ' ');

  return message;
}

function MarkovBrain() {	
	this._root = {};
	this.learning = true;
	this.spamchance = 8;
	
	this.noendwords = ['att', 'och', 'med'];
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

  if(words.length < 3) {
    return;
  }

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


    if(value.length > 0 && value !== undefined) {

      //Only add if value doesn't already exist derp
      if(this._root[segment].indexOf(value) == -1) {
        this._root[segment].push(value);
      }
    }

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
			d += "Learning state : " + s.learning.toString() + "\n";
			d += "Spamlevel : " + s.spamchance;
	
			bot.say(to, d);    
			break;	 
		case "learn":			
			s.learning = !s.learning;
			
			bot.say(to, "Learning state is now : " + s.learning);
			break;
		case "random":
			bot.say(to, s.reply("", MarkovBrain.rnd(10)));
			break;
		case "root":
			var root = parts[2] + ' ' + parts[3];
			var vals = s._root[root];

			bot.say(to, vals ? vals.join('|') : "No such root");
			break;
		case "spam":
			var val = parseInt(parts[2]);
			if(!isNaN(parseFloat(val)) && isFinite(val)) {
				s.spamchance = val;
				bot.say(to, "Spamlevel set to : " + s.spamchance);
			}
			
		
	}
		
};

function spam(bot, from, to, message) {

  //Dont bother with command spam :P
  if(message[0] === "!") {
    return;
  }

	if(s.learning) {
		message = filterMessage(message);

    if (-1 === message.indexOf(bot.nick.toLowerCase())) {
      s.learn(message);
    }
	}				
	
	//Random chance to spam crap 
	var rnd = MarkovBrain.rnd(100);
	
	if (rnd <= s.spamchance) {
		
		setTimeout(function() {
			bot.say(to, s.reply(message, MarkovBrain.rnd(10)));
		}, 5000);
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
    listen : ["#sogeti","#games","#botdev", "#ordvits"]
  },{
    name : "spam listener",
    match : /(.*)/i,
    func : spam,
    listen : ["#sogeti","#games","#botdev",, "priv"]
  }];
  
};




