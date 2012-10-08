 var Dice = require('./dice');
 var Character = require('./entity').Character;
 var Item = require('./entity').Item;
 var AI = require('./ai');
 var FSM = require('../lib/fsm');
 var Dispatcher = require('../lib/dispatcher');
 var Grid = require('../lib/grid');
 
 function Game(socket) {
   this.Rooms = {
       'Lobby' : {}
   }
   this.Characters = {};
   //Init rooms
   for(var room in this.Rooms) {
     this.Rooms[room] = new Grid(500);
   }
 }
 
 Game.prototype.registerPlayer = function(roomname, client, cid) {
   var room = this.Rooms[roomname];
   
   var player = Character.Player(client, cid);
   player.Room = roomname;
   
   player.AI = new FSM(AI.Generic, 'Idle');   
   
   room.addEntity(player, function(){});
   this.Characters[player.id] = player;
   
   room.update();
      
 };
 
 
 Game.prototype.AOIforEntity = function(entityid, _cb) {
        
   var e = this.Characters[entityid];
   var room = this.Rooms[e.Room];
   
   room.getClosest(e.pos, function(err, data){
     var json = [];
     
     var dl = data.length;
     
     while (dl--) {
       json.push(data[dl].Json());
     }
     
     _cb(err, json);
   })
 };
 
 
 module.exports = Game;
 
 
 
 
 