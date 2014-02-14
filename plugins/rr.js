var util = require('util');
var Utils = require('../utils').Utils;

function doRussianRoulette(bot, from, to, message) {
  var isChan = Utils.isChanMessage(to);

  var autoboom = false;

  var user = "";
  if (message.indexOf(' ')>0) {
    user = message.split(' ')[1];
  }

  if(user !== "" && Utils.isUserOperator(bot, to, user)) {
    return;
  } else if (user !== "" && !Utils.isUserOperator(bot, to, from)) {
    user = from;
    autoboom = true;
  } else if (user === "" && !Utils.isUserOperator(bot, to, from)) return;

  if(isChan && Utils.isUserOperator(bot, to, bot.nick)) {
    var users = Utils.userList(bot, to);

    var ua = Object.keys(users);

    var me = ua.indexOf(bot.nick);

    //Dont kick self lol
    if(me > -1) {
      ua.splice(me,1);
    }

    if (user !== "" && ua.indexOf(user) === -1){
      return;
    }

    var kick = "";
    if (user === "") {
      var rnd = Math.floor(Math.random() * ua.length);
      kick = ua[rnd];
    } else {
      kick = user;
    }

    bot.say(to, "I choose you, " + kick + "!!");

    var pew = Math.floor(Math.random() * 6) + 1;
    if(pew == 3 || autoboom) {
      bot.say(to, 'Boom!');
      bot.send('kick', to, kick, 'You have been randomly selected for termination.');
    } else {
      bot.say(to, 'Klick.')
    }
  }
}

exports.listeners = function(){
  return [{
    name : '!rr listener',
    match : /^\!rr/i,
    func : doRussianRoulette,
    listen : ["#sogeti", "#botdev"]
  }];
};