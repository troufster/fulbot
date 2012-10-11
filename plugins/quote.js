var fs = require("fs");
var log = "quotes.log";

function write(quote, cb) {
  fs.open(log, 'a', 0666, function(err, fd) {
    if(err) return;

    if(quote.length < 2) {
      return cb(null, "Nopenopenope");
    }
    fs.write(fd, quote + "\n", null, undefined, function(err, written) {
      cb(null, written + " bytes written");
    }); 
  });
}

function random(cb) {
  fs.readFile(log, function(err, fd) {
    if(err) return;
    var rows = fd.toString().split("\n");
    rows = rows.slice(0, rows.length-1);
    var rand = Math.floor(Math.random() * rows.length);
    cb(null, "Quote #" + rand + ": " + rows[rand]);
  });
}

function row(n, cb) {
  fs.readFile(log, function(err, fd) {
    if(err) return;
    var rows = fd.toString().split("\n");
    rows = rows.slice(0, rows.length-1);
    var row = rows[n];

    if(row !== null && row !== undefined) {
      cb(null, "Quote #" + n + ": " + row);
    } else {
      cb(null, "Hey stupid, quote #" + n + " does not exist");
    }
  });
}


function search(str, cb) {
 fs.readFile(log, function(err, fd){
   if(err) return;
  var rows = fd.toString().split("\n");
  rows = rows.slice(0, rows.length-1);
  var results = [];
  for(var i = 0, l = rows.length; i < l; i++) {
    var q = rows[i];
    
    if(q.indexOf(str) != -1) {
      results.push("Quote #" + i + ": " + rows[i]);
    }
  }

  if(results.length ==0) {
    cb(null, ["No match found for: " + str]);
  }
  cb(null, results);
 });
}

function stats(cb) {
  fs.readFile(log, function(err,fd) {
    if(err) return;
    var rows = fd.toString().split("\n");
    var str = "I have " + (rows.length -1) + " quotezors up in dis here filesystem.";
    cb(null, str);
  });
}

function quoteMain(bot, from, to, message) {
  var parts = message.split(" ");
  
  var command = parts[1];

  var rest = parts.slice(2,parts.length).join(" ");;

  //Hashes

  if(command !== undefined && command.indexOf("#") != -1) {
    var n = command.replace('#', '');
    row(n, function(e,d) {
      if(e) return;
      bot.say(to, d);
    });  
    return;
  }


  switch(command) {
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
      search(parts[2], function(err, d) {
        if(err)return;
        for(var i = 0, l = d.length; i <l ; i++) {
          bot.say(to, d[i]);
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


exports.listeners = function() {
  return [{
    name : "Quotebot",
      match : /^\!quote/i,
      func : quoteMain,
      listen : ["#sogeti"]
  }];
};
