"use strict";

var fs = require("fs");
var resfile = 'quotes.json';
var dir = "quotes";
var Utils = require('../utils').Utils;
var configMixin = require('../resourceManager.js').mixin;

function Quotes() {
  this.data = [];
}

configMixin(Quotes);

var q = new Quotes();

function doSave() {
  setInterval(function () {
    q.save(dir, resfile, q.data, function (e) {
      if (e) {
        return console.log("Could not save quites :( :" + e);
      }
      return console.log("Quotes saved...");
    });
  }, 100000);
}

q.load(dir, resfile, function(e, d) {
  if (e) {
    throw e;
  }

  if (d !== undefined) {
    q.data = d;

    require('./quoteweb/app.js');
  }

  doSave();
});

function write(quote, cb) {
  if(quote.length < 2) {
    return cb(null, "Nopenopenope");
  }

  q.data.push({
    points : 0,
    text : quote,
    id : q.data.length,
    subject : "Quote #" + (q.data.length)
  });

  cb(null, "Quote #" + q.data.length + " added");
}

function random(cb) {
  var n = q.data.length;

  var rand = Math.floor(Math.random() * n);

  var quote = q.data[rand];

  cb(null, "Quote #" + quote.id + ": " + quote.text);
}


function getQuote(id) {
  for(var i = 0, l = q.data.length; i < l; i++) {
    var quote = q.data[i];

    if(quote.id == id) {
      return quote;
    }
  }

  return null;
}

function row(n, cb) {
  var r = getQuote(n);

  if(r !== null && r !== undefined) {
    cb(null, "Quote #" + r.id + ": " + r.text);
  } else {
    cb(null, "Hey stupid, quote #" + n + " does not exist");
  }
}


function search(str, throttle, cb) {
  var results = [];

  for(var i = 0, l = q.data.length; i < l && throttle > 0 ; i++) {
    var quote = q.data[i];

    if(quote.text.indexOf(str) !== -1) {
      results.push("Quote #" + quote.id + ": " + quote.text);
      throttle--;
    }
  }

  if(results.length === 0) {
    return cb(null, ["No match found for: " + str]);
  }

  cb(null, results);
}

function stats(cb) {
  var str = "I have " + (q.data.length) + " quotezors up in dis here json.";
  cb(null, str);
}

function quoteMain(bot, from, to, message) {
  var parts = message.split(" ");

  var command = parts[1];

  var rest = parts.slice(2,parts.length).join(" ");

  //Hashes

  if(command !== undefined && command.indexOf("#") !== -1) {
    var n = command.replace('#', '');
    row(n, function(e,d) {
      if(e) return;
      bot.say(to, d);
    });  
    return;
  }

  switch(command) {
    case "vote":

      if(Utils.isChanMessage(to)) {
        return;
      }

      var votequoteid = parts[2].replace('#','');
      var votequote = getQuote(votequoteid);

      if(!votequote) {
        return;
      }


      //Add voter
      if(!votequote.voters) {
        votequote.voters = [];
      }

      //Already voted
      if(votequote.voters.indexOf(to) > -1) {
        return bot.say(to, "Nope");
      }


      votequote.voters.push(to);


      //Add score
      votequote.points += 1;

      bot.say(to, "Vote for quote #" + votequoteid + " registered");
      break;
    case "add":
      write(rest, function(err, d) {
        if(err) return;
        bot.say(to, d);
      });
      break;
    case "stats":
      stats(function(err, d) {
        if(err)return;
        bot.say(to, d);
      });
      break;
    case "search":
      var throttle = parseInt(parts[3]);
      if(isNaN(throttle) || throttle < 1 ) {
        throttle = 5;
      }
      search(parts[2], throttle, function(err, d) {
        if(err)return;
        for(var i = 0, l = d.length; i <l ; i++) {
          bot.say(from, d[i]);
        }
      });
      break;
    default:
      random(function(err, d) {
        if(err)return;
        bot.say(to, d);
      });
      break;
  }
}

exports.quotes = function() {
  return q.data;
};

exports.listeners = function() {
  return [{
    name : "Quotebot",
      match : /^\!quote/i,
      func : quoteMain,
      listen : ["#sogeti", "priv", "#botdev"]
  }];
};


