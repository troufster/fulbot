util = require('util');
fs = require("fs");

var triviaList = "./resources/trivia/trivia.txt";
var userlist = "./resources/trivia/triviausers.txt";

var users = [];
var questions = {};

function init(){
    questions = read(triviaList);
    console.log("log: " + questions);
    //read(userlist, users);
    //console.log("users: " +  users);
}

function read(file){
    return JSON.parse(fs.readFileSync(file));
}

function write(file, json){
    fs.open(file, 'w', 0666,
        function(err, fd) {
            if(err) return;
            fs.write(fd,  JSON.stringify(json), null, undefined, function(err, written) {});
        }
    );
}



function trivia(bot, from, to, message){
    var c = 0;
    var q = 0;
    for (var question in questions){
        c++;
        q += questions[question].length;
    }
    bot.say(to,util.format("I got %s categories and %s questions total", c, q*2));

};


exports.listeners = function(){return [{
    name : "trivia",
    match : /^\!trivia/i,
    func : trivia,
    listen : ["chan"]
}/*, {
    name : "hangmanConfig",
    match : /^\!hangman/i,
    func : hangmanConfig,
    listen : ["chan"]
}*/]};
init();