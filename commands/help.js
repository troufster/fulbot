
//this == callee scope == Listener
function doStuff(from, to, message) {
  var bot = this.bot;

  var str = "";

  for(var i = 0, l = this.listeners.length; i < l; i++) {
    var listener = this.listeners[i];
    for(var j = 0, jl = listener.length; j < jl; j++) {

      str += i + ": " + listener[j].name + "::" +  listener[j].match + "::" + listener[j] + "\n";
    }

  }

  bot.say(to, str);
}

exports.listeners = function(){
  return {
    cmd : 'listeners',
    desc : 'Shows current listener routes',
    func : doStuff
  };
};