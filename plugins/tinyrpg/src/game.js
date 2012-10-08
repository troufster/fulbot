 var Dice = require('./dice');
 var Character = require('./entity').Character;
 var Item = require('./entity').Item;
 var AI = require('./ai');
 var FSM = require('../lib/fsm');
 var Dispatcher = require('../lib/dispatcher');
 var Grid = require('../lib/grid');
 var Vector = require('../lib/vector');
 var Generators = require('./generators');



 function Game(bot) {
   this.Rooms = {
       'Lobby' : {}
   }

   this.bot = bot;
   this.running = false;
   this.Characters = {};
   this.Players = {};
   //Init rooms
   /*
   for(var room in this.Rooms) {
     this.Rooms[room] = new Grid(500);
   }*/
 }

 //Expose singleton
 Game.Dispatcher = Dispatcher;


 Game.prototype.start = function() {
   var that = this;
   that.running = true;

   console.log("Starting game...");
   setInterval(function() {

      if(!that.running) return;

      for(var char in that.Characters) {
        var c = that.Characters[char];
        c.AI.runCurrent(c);
        //console.log(that.CH);
      }

      for(var pl in that.Players) {
        var p = that.Players[pl];
        p.AI.runCurrent(p);
        //console.log(char.AI);
      }

     console.log("Tick");
   }, 2000);

 };

 Game.prototype.getInventory = function(name, _cb) {
   var player = this.Players[name];

   if(!player) _cb('Nope');

   _cb(null, player.Inventory);
 };

 Game.prototype.lookRoom = function(player, _cb) {
   var chars = Object.keys(this.Characters);
   var players = Object.keys(this.Players);

   _cb(null, players.concat(chars));
 };

 Game.prototype.playerDeath = function(name) {
   delete this.Players[name];
   delete this.Characters[name];
 };

 Game.prototype.findCharacter = function(searchstr, _cb) {
   var charkeys = Object.keys(this.Characters);
   var playkeys = Object.keys(this.Players);

   var usearch = searchstr.toUpperCase();

    var hit = -1;
   var plhit = -1;

   for(var i = 0, l = charkeys.length; i< l; i++) {
     if(charkeys[i].toUpperCase().indexOf(usearch) > -1) {
       hit = i;
       break;
     }
   }

   for(var i = 0, l = playkeys.length; i< l; i++) {
     if(playkeys[i].toUpperCase().indexOf(usearch) > -1) {
       plhit = i;
       break;
     }
   }

   console.log(hit, charkeys);

   if(hit > -1) {
     _cb(null, this.Characters[charkeys[hit]]);
   }
   else if (plhit > -1) {
     _cb(null, this.Players[playkeys[plhit]]);
   }
   else {
     _cb("No such character found");
   }
 }

 Game.prototype.spawnMonster = function(_cb) {
   var gen = new Generators.MonsterGenerator().generate(10,1);

   for(var mon in gen) {
     var m = gen[mon];

     this.Characters[m.Name] = m;
   }

   _cb(null, gen[0]);
 }

 Game.prototype.getPlayerByName = function(name, _cb) {
   var p = this.Players[name];

   if(!p) _cb('No such player');

   _cb(null, p);
 }

 Game.prototype.newPlayer = function(name, _cb) {
   var player = new Character({ STR: 10, DEX: 10, MIND: 10, Name : name, pos : new Vector(1,1)});
   player.AI = new FSM(AI.Generic, 'Idle');
  player.Level = 1;

   var Sword = new Item({ DEX : 1, Name : 'Sword of Quickness', DRoll : 5, Type : 'Weapon'});
   var Armor = new Item({ AC : 5, Name : 'Cloak of Pew', Type : 'Armor'});

   player.Equip(Sword);
   player.Equip(Armor);
   player.Reset();

   this.Players[name] = player;

   _cb(null, player);
 }
 
 module.exports = Game;
 
 
 
 
 