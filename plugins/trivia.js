var util = require('util');

var Trivia = require("./trivia/trivia.js").Trivia;

var tt = null;

function answer(bot, from, to, message){
    if (tt == null || !tt.running) {
        return;
    }
    tt.giveAnswer(from, message.replace('@',''));

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
        case "pass":
            if (tt.running) tt.pass(from);
            break;
        case "scores":
            //tt.printTotalScores();
        case "add":
            break;
    }

};


exports.listeners = function(){return [{
    name : "trivia",
    match : /^\!trivia/i,
    func : trivia,
    listen : ["#bruce"]
}, {
    name : "trivia",
    match : /[^!].*/,
    func : answer,
    listen : ["#bruce"]
}]};