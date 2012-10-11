var Game = require('./tinyrpg/src/game');

var game = null;
var _bot = null;

function isNumeric(n) {
return !isNaN(parseFloat(n) && isFinite(n));
}

function myChanUsers() {
	//Todo: centralize constants
	return _bot.chans['#martin'].users;
}

function nameUserMatch() {
	var users = myChanUsers();
}

function rpgMain(bot, from, to, message) {

  if(!game) {
    game = new Game(bot);
	_bot = bot;

    //Combat spam events
    Game.Dispatcher.Emitter.on('combat', function(ev){
	
		var userattacker = myChanUsers()[ev.Message.attacker];
		var userdefender = myChanUsers()[ev.Message.defender];
		
		
		console.log("SPAM:", userattacker, userdefender);

		//Combat spam in PMs
	 if( userattacker || userdefender ) {
			var atk = userattacker ? ev.Message.attacker : ev.Message.defender;
			bot.say(atk, ev.Message.message.replace(atk, 'You') );
	  } 
	
      //bot.say(to, ev.Message.message + ' ' + ev.Message.attacker );
    });

    //Char spam events
    Game.Dispatcher.Emitter.on('character', function(ev){
      bot.say(to, ev.Message );
    });

    //Deafththb :((
    Game.Dispatcher.Emitter.on('death', function(ev){
      bot.say(to, "{0} killed {1} for {2} exp".format(ev.Message.attacker, ev.Message.defender, ev.Message.exp));
      game.playerDeath(ev.Message.defender);
    });

    //Drop spam
    Game.Dispatcher.Emitter.on('item', function(ev){
      bot.say(to, ev.Message.player + " received " + ev.Message.item.Name );
      console.log(ev);
    });
	
	 //Spawn events
    Game.Dispatcher.Emitter.on('spawn', function(ev){
      bot.say(to, "A wild " + ev.Message.actor + " appears!" );
      console.log(ev);
    });

    game.start();
  }

  var parts = message.split(" ");

  var command = parts[1];

  var rest = parts.slice(2,parts.length).join(" ");;

  //Hashes
/*
  if(command !== undefined && command.indexOf("#") != -1) {
    var n = command.replace('#', '');
    row(n, function(e,d) {
      if(e) return;
      bot.say(to, d);
    });
    return;
  }
*/

  switch(command) {
	case "n":
	case "new":
    case "newgame":
      game.newPlayer(from, function(e,d) {
        if(!e) {
          bot.say(to, d.Readable());
        }
      });

      break;
	case "s":
	case "sta":
	case "st":
    case "stats":
      game.getPlayerByName(from, function(e,d) {
	  
        if(e) {
          bot.say(to, "You have no player, " + from);
          return;
        }

        if(d) {
         bot.say(to, d.Readable());
        }

      });
      break;
    case "spawnffs":
	
      game.spawnMonster(function(e, d) {
        bot.say(to, "A wild " + d.Name + " appears.");
      });
	  
      break;
	case "k":
	case "f":
    case "fight":
    case "kill":
	
      game.getPlayerByName(from, function(e, player){
        if(e) return;

        game.findCharacter(rest, function(e, d) {
          if(e) return;
		  if(!player) return;
		  if(!player.Name) return;
          if(player.Name == d.Name) {
            return bot.say(to, "Silly " + from + " you can't attack yourself...");
          }
          if(d) {
            bot.say(to, from + " charges at " + d.Name);

            //Fight!
            if(player) player.Attack(d);
          }
        });
      });
	  
      break;
	case "l":
	case "lo":
    case "look":
	
      game.lookRoom(from, function(e, d) {
        bot.say(to, d.join(", "));
      });
	  
      break;
	case "i":
    case "inv":
	
      game.getInventory(from, function(e, d) {

        if(!d) return;

        if(d.length > 0 && rest.trim().length > 0 && isNumeric(rest.trim())) {
          return bot.say(to, JSON.stringify(d[rest.trim()]));
        }

        var print = [];
        for(var i = 0, l = d.length; i <l; i++) {
          print.push("{0}:{1}".format(i, d[i].Name));
        }

        if(print.length > 0) {
          return bot.say(to, print.join("|"));
        } else {
          return bot.say(to, "You don't have any loots " + from + " :(");
        }
      });
	  
      break;
	case "e":
    case "equip":
      game.getInventory(from, function(e, d) {

        if(!d) return;

        if(d.length > 0 && rest.trim().length > 0 && isNumeric(rest.trim())) {
          game.getPlayerByName(from, function(e, player){
            game.equipInventory(player.Name, rest.trim());
          });
        }
      });
      break;
 case "throw":
      game.getInventory(from, function(e, d) {

        if(!d) return;

        if(d.length > 0 && rest.trim().length > 0 && isNumeric(rest.trim())) {
          game.getPlayerByName(from, function(e, player){
            game.throwInventory(player.Name, rest.trim());
          });
        }
      });
      break;
	case "sp":
	case "spend": 
		var p = rest.split(" ");
		
		if(p.length != 2) return;
		
		var stat = p[0];
		var val = p[1];
		
		if(['STR', 'DEX', 'MIND'].indexOf(stat.toUpperCase()) < 0) return;
		if(!isNumeric(val)) return;
		
		game.spendPoints(from, stat, val);
		
		break;
	case "ins":
	case "inspect":
		var p = rest.trim();
		if(!p) return;
		
		game.findCharacter(p, function(e, c) {
			if(c) {
				bot.say(to,c.Readable());
			}
		});
		
		break;
  case "save":
    var p = from.trim();
    if(!p) return;

    game.save(p, function(err, x){
      if(err) return bot.say(to, err);

      bot.say(to, p + ' saved!');
    });
      break;
  default:

      break;
  }
}


exports.listeners = function() {
  return [{
    name : "tinyrpg",
    match : /^\!rpg/i,
    func : rpgMain,
    listen : ["#rpg", "priv"]
  }];
};