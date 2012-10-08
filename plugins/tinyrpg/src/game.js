 var Dice = require('./dice');
 var Character = require('./entity').Character;
 var Item = require('./entity').Item;
 var AI = require('./ai');
 var FSM = require('../lib/fsm');
 var Dispatcher = require('../lib/dispatcher');
 var Grid = require('../lib/grid');
 var Vector = require('../lib/vector');
 
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

 }

 Game.prototype.playerDeath = function(name) {
   delete this.Players[name];
 }

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
   var monster = new Character({ STR: 1, DEX: 1, MIND: 1, Name : 'Grobgorothnogothoth'});
   monster.AI = new FSM(AI.Generic, 'Idle');

   this.Characters[monster.Name] = monster;
   _cb(null, monster);
 }

 Game.prototype.getPlayerByName = function(name, _cb) {
   var p = this.Players[name];

   if(!p) _cb('No such player');

   _cb(null, p);
 }

 Game.prototype.newPlayer = function(name, _cb) {
   var player = new Character({ STR: 1, DEX: 1, MIND: 1, Name : name, pos : new Vector(1,1)});
   player.AI = new FSM(AI.Generic, 'Idle');

   this.Players[name] = player;

   _cb(null, player);
 }
 
 module.exports = Game;
 
 
 
 
 