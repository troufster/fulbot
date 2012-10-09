var util = require('util');

var Trivia = require("./trivia/trivia.js");

var tt = null;

function answer(bot, from, to, message){
    if (tt == null) {
        bot.say(to, "no game started yet");
        return;
    }
    bot.say(to, "That is correct!");
    tt.nextQuestion();
}


function trivia(bot, from, to, message){

    if (tt == null){
        tt = new Trivia(bot, to);
    }

    var parts = message.split(' ');
    parts.splice(0,1);
    var command = parts[0];

    switch(command)
    {
        case "play":
            if (parts.lengt > 1)
                tt.newRound(parts[1]);
            else
                tt.newRound();
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
