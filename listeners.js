var listeners = [];

var bot = null;


function addListener(l) {
  listeners.push(l);
}

function init(bot) {
  bot = bot;
}

function checkListeners(from, to, message) {
  for(var i = 0, l = listeners.length; i < l; i++) {
   var listener = listeners[i];
   
   if(message.match(listener.match)) {
     listener.func(from, to, message);
   }  
  }
}

module.exports = {
  addListener : addListener,
  init : init,
  checkListeners : checkListeners
};

