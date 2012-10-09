var util = require('util');
var fs = require("fs");

var Questions = require('./questions.js');
var Answer = require('./answer.js');
var Users = require('./users.js');

function Trivia(bot, channel){
    this.bot = bot;
    this.channel = channel;
    this.question = new Questions();
    this.answer = new Answer();
    this.Users = new Users();

    bot.say(channel, util.format("I've got 99 problems but these %s questions ain't one", this.question.total()));
}



function write(file, json){
    fs.open(file, 'w', 0666,
        function(err, fd) {
            if(err) return;
            fs.write(fd,  JSON.stringify(json), null, undefined, function(err, written) {});
        }
    );
}


module.exports = Trivia;