'use strict';
let plugin = require('../Plugin.js').Plugin;
let listener = require('../Listener.js').Listener;

class MarkovBrain {
  constructor(data){
    this._root = data;
    this.learning = true;
    this.spamchance = -1;
  }

  get root(){
    return this._root;
  }

  random () {
    let roots = Object.keys(this._root);
    let r = MarkovBrain.rnd(roots.length);
    let rr = roots[r].split(' ');

    return [rr[0], rr[1], this._root[roots[r]][MarkovBrain.rnd(this._root[roots[r]].length)]];
  }

  reply (source, depth) {
    let reply = [];

    //Try to choose a word pair from the source
    let randomly;
    let asource = source.split(' ');

    let rsource = MarkovBrain.rnd(asource.length);
    if(rsource >= asource.length-1) {
      rsource = asource.length-2;
    }
    let rpick = asource[rsource] + ' ' + asource[rsource+1];
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
    let next;

    for(let i = 0; i < depth; i++){
      next = randomly[1] + ' ' + randomly[2];

      if(this._root.hasOwnProperty(next)) {
        let val = this._root[next][MarkovBrain.rnd(this._root[next.length])];

        reply.push(val);
        randomly = ['', randomly[2], val];
      } else {
        randomly = this.random();
        reply.push(randomly[0]);
        reply.push(randomly[1]);
        reply.push(randomly[2]);
      }
    }

    let retval = reply.join(" ") + ".";

    //Trim whitespace
    retval = trimstr(retval);

    //Capitalize first letter
    retval = retval.charAt(0).toUpperCase() + retval.slice(1);

    //Remove double whitespaces
    retval = retval.replace(/\s+/g, ' ');

    return retval;
  }

  learn (data) {
    let words = data.split(' ');

    if(words.length < 3) {
      return;
    }

    let limit = words.length-2;
    let i = 0;

    while(i < limit) {
      let first = words[i];
      let second = words[i+1];
      let value = words[i+2];

      let segment = first + ' ' + second;

      if(!this._root.hasOwnProperty(segment)) {
        this._root[segment] = [];
      }

      if(value.length > 0 && value !== undefined) {
        //Only add if value doesn't already exist derp

        if(this._root[segment].indexOf(value) === -1) {
          this._root[segment].push(value);
        }
      }
      i++;
    }
  }

  static rnd (ceil) {
    return ~~(Math.random()*ceil);
  }
}


class Brainz extends plugin {
  constructor() {
    super();
    this.listeners = [
      new listener("!brain listener", /^!brain/i, this.brain, ["#sogeti", "#games", "#botdev", "#ordvits"]),
      new listener("spam listener", /(.*)/i, this.spam, ["#sogeti", "#games", "#botdev", "priv"])
    ];

    ;
    let that = this;
    this.load('/brain','brain.json', function(e, d) {
      if (d !== undefined){
        that.markov = new MarkovBrain(d);
      } else {
        that.markov = new MarkovBrain({});
      }
      that.doSave();
    })
  }

  brain (bot, from, to, message) {
    let parts = message.split(" ");

    let command = parts[1];

    switch(command) {
      case "stats":
        var cells = Object.keys(this.markov.root).length;
        var d = cells + " roots in my brain, sir.\nUsing " + process.memoryUsage().rss + " bytes of sweet, juicy memory\n" ;
        d += "Learning state : " + this.markov.learning.toString() + "\n";
        d += "Spamlevel : " + this.markov.spamchance;

        bot.say(to, d);
        break;
      case "learn":
        this.markov.learning = !this.markov.learning;

        bot.say(to, "Learning state is now : " + this.markov.learning);
        break;
      case "random":
        bot.say(to, this.markov.reply("", MarkovBrain.rnd(10)));
        break;
      case "root":
        var root = parts[2] + ' ' + parts[3];
        var vals = this.markov.root[root];

        bot.say(to, vals ? vals.join('|') : "No such root");
        break;
      case "spam":
        var val = parseInt(parts[2],10);
        if(!isNaN(parseFloat(val)) && isFinite(val)) {
          this.markov.spamchance = val;
          bot.say(to, "Spamlevel set to : " + this.markov.spamchance);
        }
    }
  }

  spam (bot, from, to, message) {

    //Don't bother with command spam :P
    if(message[0] === "!") {
      return;
    }

    if(this.markov.learning) {
      message = filterMessage(message);

      if (-1 === message.indexOf(bot.nick.toLowerCase())) {
        this.markov.learn(message);
      }
    }

    //Random chance to spam crap
    let r = MarkovBrain.rnd(100);

    if (r <= this.markov.spamchance) {

      setTimeout(function() {
        bot.say(to, this.markov.reply(message, MarkovBrain.rnd(10)));
      }, 5000);
    }


    //U talking shit about me bish?
    if(message.toLowerCase().indexOf(bot.nick.toLowerCase()) > -1) {
      bot.say(to, this.markov.reply(message, MarkovBrain.rnd(10)));
    }
  }

  //Brain save
  doSave () {
    let that = this;
    setInterval(function() {
      that.save('brain','brain.json', that.markov.root, function(e) {
        if(e) {
          console.log("Could not save brain :( :" + e);
          return;
        }
        console.log("Brain saved...");
      });
    }, 300000);
  }

}


function trimstr(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) {
      return str;
    }
    return str.substr(0,index) + chr + str.substr(index+1);
}

function filterMessage(message) {
  message = message.toLowerCase();

  //remove garbage
  message = message.replace(/"/g, "");
  message = message.replace(/'/g, "");
  message = message.replace('\n', '');
  message = message.replace('\r', '');
  //"""
  //Remove matching braces
  //Unmatched would be a smiley
  var index = 0;

  while (true){

    if(index >= message.length) {
      break;
    }
    index = message.indexOf("(", index);
    var i = message.indexOf(")", index+1);
    if(index <=0) {
      break;
    }

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

exports.plugin = Brainz;


