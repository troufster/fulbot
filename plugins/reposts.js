"use strict";

var fs = require('fs');
var util = require('util');
var Utils = require('../utils').Utils;
var resfile = './resources/reposts/reposts.json';

function Reposts() {
  this.data = {
    _urls: {},
    _nicks: {}
  };
}

Reposts.prototype.timestamp = function () {
  var d = new Date();

  var curr_date = d.getDate();
  if (curr_date < 10) {
    curr_date = "0" + curr_date;
  }

  var curr_month = d.getMonth() + 1;
  if (curr_month < 10) {
    curr_month = "0" + curr_month;
  }

  var curr_year = d.getFullYear();


  var hour = d.getHours();
  if (hour < 10) {
    hour = "0" + hour;
  }

  var minutes = d.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  return curr_year + "-" + curr_month + "-" + curr_date + " " + hour + ":" + minutes;
};

Reposts.prototype.repostAtIndex = function(index) {
  var urls = Object.keys(this.data._urls);

  return (urls.length -1 > index && index >=0) ? urls[index]: "nope";
};

Reposts.prototype.indexOfRepost = function(url) {
  var urls = Object.keys(this.data._urls);

  return urls.indexOf(url);
};

Reposts.prototype.hasUrl = function (url, poster) {
  var urls = Object.keys(this.data._urls);
  var nicks = Object.keys(this.data._nicks);

  var hasurl = urls.indexOf(url) > -1;

  var hasnick = nicks.indexOf(poster) > -1;

  if (!hasurl) {
    //not a repost
    this.data._urls[url] = {
      total: 0,
      firstPoster: { nick: poster, date: this.timestamp()},
      lastPoster: {}
    };

  }
  else {
    //a repost
    this.data._urls[url].total += 1;
    this.data._urls[url].lastPoster = { nick: poster, date: this.timestamp() };


    if (!hasnick) {
      //new nick
      this.data._nicks[poster] = {
        reposts: 0,
        lastRepost: url
      };
    }

    //increment
    this.data._nicks[poster].reposts += 1;
    this.data._nicks[poster].lastRepost = url;

  }

  return hasurl;
};


function readFileJSON(filename, _cb) {
  fs.readFile(filename, function (e, d) {
    if (e) {
      //Whatever
      return _cb(null, { _urls: {}, _nicks: {}});
    }
    return _cb(null, JSON.parse(d.toString()));
  });
}

function writeFileJSON(filename, data, _cb) {
  fs.open(filename, 'w', 0x0666, function (err, d) {
    if (err) {
      return _cb(err);
    }

    return fs.write(d, JSON.stringify(data), null, undefined, function (err, written) {
      if (err) {
        _cb(err);
      }

      fs.close(d, function () {
        _cb(null, written);
      });

    });
  });
}

var s = new Reposts();


function dosave() {
  setInterval(function () {
    writeFileJSON(resfile, s.data, function (e) {
      if (e) {
        return console.log("Could not save reposts :( :" + e);
      }
      return console.log("Reposts saved...");
    });
  }, 100000);
}


readFileJSON(resfile, function (e, d) {
  if (e) {
    throw e;
  }
  s.data = d;
  dosave();
});


var regex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;


function stats() {


  var urls = Object.keys(s.data._urls);
  var nicks = Object.keys(s.data._nicks);

  var repostking = { reposts: 0, nick: 'Not yet crowned' };

  for (var i = 0, l = nicks.length; i < l; i++) {
    var nick = s.data._nicks[nicks[i]];

    if (nick.reposts > repostking.reposts) {
      repostking = { reposts: nick.reposts, nick: nicks[i]};
      continue;
    }
  }


  return urls.length + " urls tracked. King of reposts: " + repostking.nick + " with " + repostking.reposts + " reposts";


}

function spam(bot, from, to, message) {
  //var isChan = Utils.isChanMessage(to);

  // console.log("MESSAGE", message);

  var urls = message.match(regex);

  if (urls !== null) {
    //Url present

    for (var i = 0, l = urls.length; i < l; i++) {
      if (s.hasUrl(urls[i], from)) {
        var repost = s.data._urls[urls[i]];



        bot.say(to, "Repost!! " + urls[i] + " posted " + repost.total + " times since " + repost.firstPoster.date + " (first by " + repost.firstPoster.nick + ")");


      }
    }
  }
}

function command(bot, from, to, message) {

  var isChan = Utils.isChanMessage(to);
  var tokens = message.split(" ");
  var cmd = tokens[1];
  var subcmd = tokens[2];

  switch (cmd) {
    case "r":
    case "req":
    case "request":
      bot.say(to, s.repostAtIndex(subcmd));
      break;
    case "s":
    case "stats":
      bot.say(to, stats());
      //console.log(s.data._nicks);
      break;
    case "c":
    case "check":
      //Only allow checking in PM
      if(isChan) {
        return;
      }

      var urls = message.match(regex);

      if(!urls) {
        return;
      }

      var reposts = [];
      for (var i = 0, l = urls.length; i < l; i++) {
        var url = urls[i];

        var index = s.indexOfRepost(url);
        if(index > -1) {
          reposts.push("[" + index +  "] -> " + url);
        }
      }

      var result = urls.length + " urls checked, reposts found : " + (reposts.length > 0 ? reposts.join(', ') : "none");
      bot.say(to, result);
      break;
  }

}

exports.listeners = function () {
  return [
    {
      name: '!repost listener',
      match: /^!repost/i,
      func: command,
      listen: ["#sogeti", "#games", "#botdev", "priv"]
    },
    {
      name: "repost spam listener",
      match: /(.*)/i,
      func: spam,
      listen: ["#sogeti", "#games", "#botdev"]
    }
  ];
};
