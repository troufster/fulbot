
var hellos = [
 "Woop woop!",
 "Allahu akhbar!!!11",
 "FNISS",
 "Konsultmässighet!"
]


function sayHello(bot, from, to, message) {
  bot.say(to, hellos[Math.floor(Math.random() * hellos.length)]);
}

exports.listeners = function(){
    return [{
        name : '!hello listener',
        match : /\!hello/i,
        func : sayHello,
        listen : ["#sogeti", "priv"]
    }];
};