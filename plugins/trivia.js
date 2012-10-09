var util = require('util');

var Trivia = require("./trivia/trivia.js");

var tt = null;

function answer(bot, from, to, message){
    if (trivia == null) {
        bot.say(to, "no game started yet");
        return;
    }
    bot.say(to, message);
}


function trivia(bot, from, to, message){

    if (tt == null){
        tt = new Trivia(bot, to);
    }

    var parts = message.split(' ').splice(0,1);

    var command = parts.splice(0,1);

    switch(command)
    {
        case "play":
            break;
        case "add":
            break;
    }

};


exports.listeners = function(){return [{
    name : "trivia",
    match : /^\!trivia/i,
    func : trivia,
    listen : ["chan"]
}, {
    name : "trivia",
    match : /@/i,
    func : answer,
    listen : ["chan"]
}]};
