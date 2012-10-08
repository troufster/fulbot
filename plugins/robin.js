var Game = require('./tinyrpg/src/game');


var game = null;


function rpgMain(bot, from, to, message) {

  if(!game) {
    game = new Game(bot);

    //Combat spam events
    Game.Dispatcher.Emitter.on('combat', function(ev){
      bot.say(to, ev.Message );
    });

    //Char spam events
    Game.Dispatcher.Emitter.on('character', function(ev){
      bot.say(to, ev.Message );
    });

    //Deafththb :((
    Game.Dispatcher.Emitter.on('death', function(ev){
      bot.say(to, "R.I.P. " + ev.Message + " (lol noob)" );
      game.playerDeath(ev.Message);
    });

    //Drop spam
    Game.Dispatcher.Emitter.on('item', function(ev){
      bot.say(to, ev.Message.player + " received " + ev.Message.item.Name );
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
    case "newgame":
      game.newPlayer(from, function(e,d) {
        if(!e) {
          bot.say(to, d.Readable());
        }
      });

      break;
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
    case "spawn":
      game.spawnMonster(function(e, d) {
        bot.say(to, "A wild " + d.Name + " appears.");
      });
      break;
    case "fight":

      game.getPlayerByName(from, function(e, player){
        if(e) return;

        game.findCharacter(rest, function(e, d) {
          if(e) return;
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
    case "look":
      game.lookRoom(from, function(e, d) {
        bot.say(to, d.join(", "));
      });
      break;
    case "inv":
      game.getInventory(from, function(e, d) {
        console.log(d);
        var print = [];
        for(var i = 0, l = d.length; i <l; i++) {
          print.push("{0}:{1}".format(i, d[i].Name));
        }

        if(print.length > 1) {
          return bot.say(to, print.join("|"));
        } else {
          return bot.say(to, "You don't have any loots " + from + " :(");
        }
      });
      break;
    default:

      break;
  }
}


exports.listener = function() {
  return {
    name : "tinyrpg",
    match : /^\!rpg/i,
    func : rpgMain,
    listen : ["chan", "priv"]
  };
};