var util = require('util');
var fs = require("fs");

var Questions = require('./questions.js');
var Answer = require('./answer.js');
var Users = require('./users.js');

function Trivia(bot, channel){
    this.bot = bot;
    this.channel = channel;
    this.questions = new Questions();
    this.answer = new Answer();
    this.Users = new Users();

    this.currentQuestion = null;
    this.roundQuestions = null;

    this.running = false;
    bot.say(channel, util.format("I've got 99 problems but these %s questions ain't one", this.questions.total()));
}

Trivia.prototype.newRound = function(category){
    if (this.running) {
        this.bot.say(channel, "There is already a round in progress");
        return;
    }

    this.roundQuestions = [];
    this.currentQuestion = -1;
    while(this.roundQuestions.length < 4){
        var q = this.questions.random(category);
        if (this.roundQuestions.indexOf(q) == -1)
            this.roundQuestions.push(q);
    }

    this.bot.say(this.channel,"A new round has begun");
    this.nextQuestion();
}

Trivia.prototype.nextQuestion = function(){
    if (this.roundQuestions.length > 0) {
        this.currentQuestion = this.roundQuestions.pop();
        this.bot.say(this.channel, this.currentQuestion.question);
    }
    else {
        this.roundFinished();
    }
}
Trivia.prototype.roundFinished = function(){
    this.bot.say(this.channel, "done done done");
    this.currentQuestion = null;
    this.roundQuestions = null;
    this.running = false;
}

Trivia.prototype.giveAnswer = function(from, answer){

}

module.exports = Trivia;