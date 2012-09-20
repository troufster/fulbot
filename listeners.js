function Listener() {
  this.listeners = [];
  this.bot = null;
}

Listener.prototype.addListener = function(l) {
  this.listeners.push(l);
}

Listener.prototype.init = function(bot) {
  this.bot = bot;
}

Listener.prototype.checkListeners =function(from, to, message) {
  for(var i = 0, l = this.listeners.length; i < l; i++) {
   var listener = this.listeners[i];
   if(message.match(listener.match)) {
     listener.func(this.bot, from, to, message);
   }  
  }

  //Debug
  if(message.match(/\!chanlisteners/i)) {
    for(var i = 0, l = this.listeners.length; i < l; i++) {
      var listener = this.listeners[i];
      this.bot.say(to, i + ": " + listener.name + "::" +  listener.match);
    }
  }
}

exports.Listener = Listener;

