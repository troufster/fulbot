
function sayHello(bot, from, to, message) {
  bot.say(to, "Woooooooooooooo");
}

exports.listener = function(){
  return {
    name : '!hello listener',
    match : /\!hello/i,
    func : sayHello,
    listen : ["chan"]
  }
};
