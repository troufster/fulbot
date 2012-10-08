var io = require('socket.io').listen(3131);;
var Dispatcher = require('./dispatcher');
var microtime = require('microtime')
var Game = require('../src/game');


var game = new Game(io);

//Bind event dispatcher
Dispatcher.Io = io;

function Packet(data) {
  data.time = microtime.now();
  return data;
}



io.sockets.on('connection', function(socket) {
  socket.emit('msg', Packet({ type: 'authreq' }));
  
  //Client auth request
  socket.on('auth', function(data){
    //Todo: auth
    socket.emit('msg', Packet({ type: 'auth_ok'}));
  });
  
  //Client asset request
  socket.on('assets', function(){
    
           
    //Init player
    game.registerPlayer('Lobby', socket, 'whateveridofselectedcharacter');
    
    //Send him his zone
    game.AOIforEntity(socket.id, function(err, data){      
      socket.emit('msg', Packet({ type : 'aoi' , aoi : data }));
    })
  });
  
});
