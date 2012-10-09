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
    this.timeouts = [];
    this.currentQuestion = -1;
    while(this.roundQuestions.length < 4){
        var q = this.questions.random(category);
        if (this.roundQuestions.indexOf(q) == -1)
            this.roundQuestions.push(q);
    }

    this.speak("A new round has begun");
    this.running = true;
    this.nextQuestion();
}

Trivia.prototype.nextQuestion = function(){
    this.currentAnswers = [];
    for(var i = this.timeouts.length-1;i>=0;i--)
    {
        clearTimeout(this.timeouts[i]);
        this.timeouts.pop();
    }

    if (this.roundQuestions.length > 0) {
        this.currentQuestion = this.roundQuestions.pop();
        switch(this.currentQuestion.type){
            case "*":
                //unscramble
                this.speak(util.format("What word am I looking for: %s ", this.currentQuestion.question) );
                break;
            case "abc":
                //multiple choice
                var t = this.currentQuestion.question;
                var a = this.currentQuestion.choice.reverse();
                for(var i = a.length-1;i>= 0; i--){
                    t += " " + a[i];
                }
                this.speak(t);
                break;
            default:
                //open, could be more than 1 answer required
                this.speak(this.currentQuestion.question);
                this.answerCount = parseInt(this.currentQuestion.type);
                break;
        }
        var that = this;
        this.timeouts.push(setTimeout(function(){that.bot.say(that.channel, "15 seconds remaining until next question.")}, 15000));
        this.timeouts.push(setTimeout(function(){that.bot.say(that.channel, "5 seconds remaining until next question.")}, 25000));
        this.timeouts.push(setTimeout(function(){that.nextQuestion()}, 30000));
    }
    else {
        this.roundFinished();
    }
}
Trivia.prototype.roundFinished = function(){
    this.speak( "done done done");
    this.currentQuestion = null;
    this.roundQuestions = null;
    this.running = false;
}

Trivia.prototype.giveAnswer = function(from, answer){
    answer = answer.toLowerCase();
    switch(this.currentQuestion.type){

        case "*":
            //unscramble
            if (this.currentQuestion.answer.toLowerCase() == answer){
                this.speak(util.format("That's right, %s, the correct answer was %s ",from, this.currentQuestion.answer) );
                this.nextQuestion();
            }
            break;
        case "abc":
            //multiple choice
            if (this.currentQuestion.answer.toLowerCase() == answer){
                this.speak(util.format("That's right, %s, the correct answer was %s ",from, answer));
                this.nextQuestion();
            }
            break;
        default:
            //open, could be more than 1 answer required
            if (this.currentQuestion.answer.indexOf(answer) != -1 && this.currentAnswers.indexOf(answer) == -1 ){
                this.currentAnswers.push(answer);
                this.answerCount--;
                if (this.answerCount == 0){
                    this.speak(util.format("%s was the last correct answer was I was looking for %s ", answer, from));
                    this.nextQuestion();
                } else {
                    this.speak(util.format("%s is a correct answer, %s ", answer, from));
                    this.speak(util.format("%s answers remaining.", this.answerCount) )
                }
            }
            break;
    }

}

Trivia.prototype.speak = function(message){
    this.bot.say(this.channel, message);
}

exports.unload = function() {
    delete require.cache[require.resolve('./questions.js')];
    delete require.cache[require.resolve('./answer.js')];
    delete require.cache[require.resolve('./users.js')];
}
exports.Trivia = Trivia;

