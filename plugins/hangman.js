﻿"use strict";
var util = require('util');
var fs = require("fs");

var wordlist = "./resources/hangman/swedish.txt";
var beerlist = "./resources/hangman/öl.txt";
var userlist = "./resources/hangman/users.txt";

var running = false;
var word = "";
var words = [];
var beers = [];
var correctletters = [];
var wrongletters = [];
var wrongGuess = 0;
var users = {};
var usernames = [];

var hangmanIcon = ["\\(^o^)/" ,"(^_^)","(O_^)","(O_O)", "(O_-)", "(-_-)", "(-_<)", "(>_<)", "(>_;)", "(;_;)", "(x_x)", "†" ]; //"†"

function init(){
  readWordlist();
  readUsers();
}

function readWordlist(){
  fs.readFile(wordlist, function(err, fd) {
      if(err) {
        throw err;
      }
      words = fd.toString().slice(1, words.length-2).replace(/"/g,'').split(",");

  });
  fs.exists(beerlist,function(exists){
    if(!exists) {
      return;
    }
    fs.readFile(beerlist, function(err, fd) {
      if(err) {
        throw err;
      }

      var d = fd.toString().slice(1, words.length-2).replace(/"/g,'');
      var letters = [];
      //loop, figure it out
      for(var x = 0, length = d.length; x < length; x++) {
        var l = d.charAt(x);
        if(isNaN(letters[l])){
          letters[l] = 1;
        }
      }

//output count!
      var op = "";
      for (var key in letters) {
        if(letters.hasOwnProperty(key)){
          op+=key;
        }
      }

      beers = fd.toString().slice(1, words.length-2).replace(/"/g,'').toLowerCase().split(",");

    });
  });
}

function writeWordlist(){
fs.open(wordlist, 'w', 666, function(err, fd) {
  if(err) {
    throw err;
  }

  fs.write(fd,  words.join(','), null, undefined, function(err) {
    if(err) {
      throw err;
    }
  });
});

}


function readUsers(){
  fs.readFile(userlist, function(err, fd) {
    if(err) {
	return "No file dude";
	//L2code
      
    }
    users = JSON.parse(fd.toString());
  });
}

function getDecodedWord(){
  var myRegExp = new RegExp("[^.'&:/!#.* °(-)" + correctletters.join('') + ']','g'); //-'&:/!#.* °
  var w = word.replace(myRegExp,"_");
  return w.replace(/(?!$)/g, " ");
}

function getSentence(){
  return getDecodedWord() + "  " +  hangmanIcon[wrongGuess] +  "  " + wrongletters.join(" ");
}

function newUser(from){
  return {name : from, score : 0, g: 0, gcc: 0, gwc: 0, gcw:0, gww: 0, kills:0, hints:0, rounds:0, currentscore:0,canGuess:true };
}

function writeUsers() {
  fs.open(userlist, 'w', 666, function(err, fd) {
    if(err) {
      throw err;
    }

    fs.write(fd,  JSON.stringify(users), null, undefined, function(err) {
      if(err) {
        throw err;
      }
    });
  });
}

function play(cb, l) {
  correctletters = [];
  wrongletters = [];
  wrongGuess = 0;
  running = true;

  var keys = Object.keys(users);
  for(var i = keys.length-1;i>=0;i--) {
    users[keys[i]].canGuess = true;
  }

  var temp = [];
  if (l === 'öl') {
    if (beers.length === 0) {
      cb(null, "no beer for you");
      running = false;
      return;
    }
    temp = beers;
  } else {
    temp = words;
  }

  if (temp.length === 0) {
      cb(null, "my wordlist is empty, give me a sec to initialize");
      readWordlist();
      cb(null, "read " + temp.length + " words.");
  }
  var t = temp.sort(function(a,b){ return a.length - b.length;});
  if (l === undefined || l < 2){
      var rand = Math.floor(Math.random() * temp.length);
      word = temp[rand].trim();
  } else {
      var a = 0;
      var z = t.length-1;
      var m = Math.floor((z+a)/2);
      while (a !== z && a < z-1){
          if (t[m].length <= l){
              a = m;
          } else {
              z  = m;
          }
          m = Math.floor((a+z)/2);
      }
      t = t.slice(m, t.length);
      var r = Math.floor(Math.random() * t.length);
      word = t[r].trim();
  }
  cb(null, getSentence());
}

function done(cb){
  correctletters = []; //'-',"'",'&',':','/','!','#','.','*','°',' '
  wrongletters = [];
  wrongGuess = 0;
  running = false;
  word = "";
  var text = "Scored this round:\n ";

  usernames.forEach(function(u){
    text = text + users[u].name + ": " + users[u].currentscore + "  ";
    if (usernames.length > 1 ){
      users[u].score += users[u].currentscore;
    }
    else {
      text += "\n" + 'too few users to add to total score.';
    }
    users[u].currentscore = 0;
    users[u].rounds++;
  });

  cb(null, text);
  usernames =[];
  writeUsers();
}

function unblockUser(user){
  user.canGuess = true;
}

function guess(n, cb, from) {
  if (users[from] === undefined){
      users[from] = newUser(from);
  }
  if (usernames.indexOf(from) === -1 )
  {
      usernames.push(from);
  }
  var u = users[from];
  if (u.banned){
      u.bancount++;
      if (u.bancount < 6) {
          cb(null, u.name + " ... DERP");
      }
      return;
  }
  if(!u.canGuess) {
    return;
  }

  u.g++;

  n = n.toLowerCase();
  if (n.length === 1 && word.indexOf(n) !== -1 && correctletters.indexOf(n) === -1) {
    correctletters.push(n);
    u.currentscore++;
    u.gcc++;
    checkState(cb, u);
    u.canGuess = false;
    setTimeout(function(){unblockUser(u);},3000);
  } else if ((n.length === 1 && word.indexOf(n) === -1) || (n !== word && n.length === word.length)){

    if (n.length === 1 && wrongletters.indexOf(n) === -1) {
      wrongGuess++;
      u.gwc++;
      wrongletters.push(n);
      u.canGuess = false;
      setTimeout(function(){unblockUser(u);},3000);
    }
    else if (n.length > 1) {
      wrongGuess++;
      u.gww++;
      u.canGuess = false;
      setTimeout(function(){unblockUser(u);},3000);
    }
    checkState(cb, u);
  } else if (n === word) {
      u.currentscore += 5;
      u.gcw++;
      if (correctletters.length === 0){
        cb(null, "DAYUM! Skill level: Asian");
      }
      cb(null, from + " saved me, the correct word was: " + word);
      done(cb);
      cb(null, "Hangman survived, type !hangman play for a new round?");
  }

}

function checkState(cb, u){
  if (wrongGuess < 11) {
      if (getDecodedWord().indexOf("_") === -1){
          cb(null, util.format("%s saved me, the correct word was: %s", u.name, word));
          done(cb);
          cb(null, "Hangman survived, type !hangman play for a new round?");
      } else
      {
          cb(null, getSentence());
      }
  } else {
      u.currentscore--;
      u.kills++;
      cb(null, word + "  " +  hangmanIcon[wrongGuess] +  "  " + wrongletters.join(" "));
      cb(null, "You're all bastards, but " + u.name + " killed me!!");
      done(cb);
      cb(null, "Hangman resurrected, type !hangman play for a new round?");
  }
}

function hint(cb, from) {


  var rest = word;
  console.log(rest);
  var r = new RegExp("['&:/!#.* °(-)" + correctletters.join('') + ']','g'); //-'&:/!#.* °

  rest = rest.replace(r,'');
  console.log('rest:'+  rest);
  if (rest.length === 0) {
    return;
  }

  var unique = '';
  for(var i = rest.length -1; i>=0;i--){
    if (unique.indexOf(rest.charAt(i)) === -1 ){
      unique += rest.charAt(i);
    }
  }
  if (unique.length <= 1) {
    return;
  }

  var rand = Math.floor(Math.random() * rest.length);

  if (users[from] === undefined){
      users[from] = newUser(from);
  }



  var u = users[from];
  u.currentscore -= 1;
  u.hints++;
  u.canGuess = false;
  setTimeout(function(){unblockUser(u);},3000);
  correctletters.push(rest[rand]);

  wrongGuess++;
  checkState(cb, u);

}


function check(cb, w){
  var lw = w.toLowerCase();
  if (words.indexOf(lw) > -1){
      cb(null, util.format("Yes, I do know the word %s.",w));
  } else {
      cb(null, util.format("What? %s ain't no word I've ever heard of.", w));
  }
}


function hangMan(bot, from, to, message) {

if (running && (message.length === word.length || message.length === 1)) {
  //guessing the word or a letter
  guess(message,function(err, d) {
        if(err) {
          throw err;
        }
        bot.say(to, d);
      }, from);
}
}

function stats(cb, k) {
  var u = users[k];
  var str ="";
  if (u !== undefined){
    str = util.format("%s has guessed a total of %s times: \n    %s correct and %s incorrect letters\n    %s correct and %s incorrect words\n    Played %s rounds, used %s hints and killed me %s times",
                            u.name, u.g, u.gcc, u.gwc, u.gcw, u.gww,u.rounds, u.hints, u.kills);
  }
  else {
    str = "I have " + (words.length -1) + " Swedish words in my vocabulary. Fucking dsso up in diz bitchez!1!1!";
  }
  cb(null, str);
}

function scores(cb) {
  var text = "Total scores for all users:\n";

  var keys = Object.keys(users);
  keys.sort(function(a,b){return users[a].score - users[b].score;});

  for(var i = keys.length-1;i>=0;i--) {
      text = text + users[keys[i]].name + ": " + users[keys[i]].score + ", ";
  }
  cb(null, text);

}


function ban(k){
  var u = users[k];
  if (u !== undefined){
      u.banned = true;
      u.bancount = 0;
  }
}

function unban(k){
  var u = users[k];
  if (u !== undefined){
      u.banned = false;
  }

}

function remove(cb,w){
  words.splice(words.indexOf(w), 1);
  writeWordlist();
  cb(null, util.format("%s has been removed from the list.", w));
}


function hangmanConfig(bot, from, to, message) {
  var parts = message.split(" ");

  var command = parts[1];

  var rest = parts[2];

  var u = users[from];
  if (u !== undefined) {
    if (u.banned) {
      u.bancount++;
      if (u.bancount < 6) {
        bot.say(to, u.name + " ... DERP");
      }
    }
  }

  switch(command) {
    case "stats":
      stats(function(err, d) {
        if(err) {
          throw err;
        }
        bot.say(to, d);
      }, rest);
      break;
    case "scores":
      scores(function(err, d) {
        if(err){
          throw err;
        }
        bot.say(to, d);
      });
      break;
    case "play":
      if (!running && from !== to) {
        play(function(err, d) {
          if(err) {
            throw err;
          }
          bot.say(to, d);
        }, rest);
      } else if (from === to){
        bot.say(to, "Cannot start in private");
      }
      break;
    case "ban":
        ban(rest);
        break;
    case "unban":
        unban(rest);
        break;
    case "hint":
      if (running && from !== to ) {
        hint(function(err, d) {
          if(err) {
            throw err;
          }
          bot.say(to, d);
        },from);
      } else if (from === to){
        bot.say(to, "Cannot hint in private");
      }
      break;
    case "remove":
      remove(function(err, d) {
        if(err) {
          throw err;
        }
        bot.say(to, d);
      },rest);
      break;
    case "check":
      check(function(err, d) {
        if(err) {
          throw err;
        }
        bot.say(to, d);
      },rest);
      break;
    case "help":
      bot.say(from, "In hangman, scoring is as follows: ");
      bot.say(from, "    1 point per correct letter;");
      bot.say(from, "    5 points per correctly guessed word (i.e. typing the word);");
      bot.say(from, "   -1 points for killing me;");
      bot.say(from, "    0 point per incorrect word;");
      bot.say(from, "   -1 point per hint;");
      bot.say(from, "I accept the following commands:");
      bot.say(from, "!hangman play            starts a new round.");
      bot.say(from, "!hangman hint            get a hint at the cost of 1 point");
      bot.say(from, "!hangman remove <word>   removes <word> from the wordlist");
      bot.say(from, "!hangman stats           gives useless statistics");
      bot.say(from, "!hangman stats <nick>    gives statistics about a user");
      bot.say(from, "!hangman scores          gives the scores");
      break;
    default:
        break;


  }
}



exports.listeners = function (){ return [{
    name : "hangmanPlay",
    match : /['&:\/!#\.\* °0-9a-zåöäéæáüøèýæë]*?/i,
    func : hangMan,
    listen : ["#games","#botdev"]
  }, {
    name : "hangmanConfig",
    match : /^!hangman/i,
    func : hangmanConfig,
    listen : ["#games","#botdev"]
  }];};

init();
