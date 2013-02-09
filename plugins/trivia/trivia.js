var util = require('util');
var fs = require("fs");

var Questions = require('./questions.js');
var Users = require('./users.js');
var Utils = require('./../../utils.js').Utils;

function Trivia(bot, channel){
    this.bot = bot;
    this.channel = channel;
    this.questions = new Questions();
    this.users = new Users();

    this.currentUsers = null;
    this.currentQuestion = null;
    this.roundQuestions = null;

    this.running = false;
    this.utils = new Utils();
    this.utils.init(this.bot);
    this.speak(util.format("I've got 99 problems but these %s questions ain't one.\write !trivia play to start a new round, !trivia pass to pass on a question, @<answer> to answer a question.", this.questions.total()));
}

Trivia.prototype.newRound = function(category){
    if (this.running) {
        this.speak("There is already a round in progress");
        return;
    }

    this.roundQuestions = [];
    this.timeouts = [];
    this.players = [];
    this.currentQuestion = -1;
    while(this.roundQuestions.length < 10){
        var q = this.questions.random(category);
        if (this.roundQuestions.indexOf(q) == -1)
            this.roundQuestions.push(q);
    }

//    var l = this.utils.users(this.channel);
//    var t = "";
//    for(var u in l){
//        t += u + ", ";
//    }

    this.speak(util.format("A new round has begun"));
    this.running = true;
    this.queueQuestion(false);
}

Trivia.prototype.removeTimeouts = function(){
    for(var i = this.timeouts.length-1;i>=0;i--)
    {
        clearTimeout(this.timeouts[i]);
        this.timeouts.pop();
    }
}

Trivia.prototype.pass = function(u){
    if (this.currentQuestion == null)
        return;

    if (this.players.indexOf(u) == -1 )
        this.players.push(u);

    var currentUser = this.users.getUser(u);

    currentUser.passed = true;

    var b = true;
    for(var p in this.players){
        currentUser = this.users.getUser(this.players[p]);
        b = b & currentUser.passed;
    }
    if (b){
        this.queueQuestion(true);
    }
}

Trivia.prototype.queueQuestion = function(s){
    this.removeTimeouts();
    this.currentAnswers = [];


    if (s){
        this.speak(util.format("the correct answer was: %s. No points awarded", this.currentQuestion.answer));
    }
    this.currentQuestion = null;
    if (this.roundQuestions.length > 0) {
        var that = this;
        this.speak( "The next question start in: 5");
//        this.timeouts.push(setTimeout(function(){that.speak( "The next question start in: 4")}, 1000));
//        this.timeouts.push(setTimeout(function(){that.speak( "The next question start in: 3")}, 2000));
        //this.timeouts.push(setTimeout(function(){that.speak( "The next question start in: 2")}, 3000));
        this.timeouts.push(setTimeout(function(){that.speak( "The next question start in: 1")}, 4000));
        this.timeouts.push(setTimeout(function(){that.nextQuestion()}, 5000));
    } else {
        this.roundFinished();
    }
}

Trivia.prototype.nextQuestion = function(){
    var that = this;
    if (this.roundQuestions.length > 0) {
        this.score = 90;
        this.currentQuestion = this.roundQuestions.pop();
        console.log(this.currentQuestion.answer);
        switch(this.currentQuestion.type){
            case "*":
                //unscramble
                this.speak(util.format("\x030,12 What word am I looking for: \x03%s ", this.currentQuestion.question) );
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
                this.speak(util.format("\x030,12 %s \x03",this.currentQuestion.question ));
                this.answerCount = parseInt(this.currentQuestion.type);
                if (this.answerCount == 1){
                    this.hintedAnswer = this.currentQuestion.answer[0].replace(/[^. ]/g,'*');
                    this.speak(util.format("    %s", this.hintedAnswer) );

                    this.timeouts.push(setTimeout(function(){that.hint(30)}, 15000));
                    this.timeouts.push(setTimeout(function(){that.hint(15)}, 30000));
                }
                break;
        }
        this.timeouts.push(setTimeout(function(){that.queueQuestion(true)}, 45000));
    }
}

Trivia.prototype.hint = function(s){
    this.score -= 30;


    var c = this.hintedAnswer.split('*').length-1;

    for (var i = Math.floor(c/3); i>=0; i--){
        var rand = Math.floor(Math.random() * this.hintedAnswer.length);
        var n = this.currentQuestion.answer[0][rand];
        if (n != " "){
            var t = this.hintedAnswer.split('')
            t.splice(rand,1,n)
            this.hintedAnswer = t.join('');
        } else
        {
            i++;
        }
    }
    this.speak(util.format("\x038,12 %s\x03\x030,12 seconds remaining, points remaining: \x03\x038,12%s\x03", s, this.score) );
    this.speak(util.format("    %s", this.hintedAnswer) );
}

Trivia.prototype.updateScores = function(){
    var n= this.players.pop();
    while(n !== undefined){
        var player = this.users.getUser(n);
        player.total+= player.score;
        player.rounds++;
        player.score = 0;
        player.passed = false;
        n = this.players.pop();
    }
}

Trivia.prototype.printScores = function(){

    var that = this;
    var a = this.players.sort(function(a,b){ return that.users.getUser(a).score - that.users.getUser(b).score; });
    var n = a.pop();
    this.speak("And here are the scores for this round:")
    while (n !== undefined){
        this.speak(util.format("    %s - %s", this.users.getUser(n).score, n));
        n = a.pop();
    }

}

Trivia.prototype.roundFinished = function(){
    this.removeTimeouts();

    this.printScores();
    this.updateScores();

    this.currentQuestion = null;
    this.roundQuestions = null;
    this.running = false;
    this.users.save();
}

Trivia.prototype.giveAnswer = function(from, answer){
    if (this.currentQuestion == null)
        return;

    if (this.players.indexOf(from) == -1 )
        this.players.push(from);

    var currentUser = this.users.getUser(from);

    answer = answer.toLowerCase();
    switch(this.currentQuestion.type){

        case "*":
            //unscramble
            if (this.currentQuestion.answer.toLowerCase() == answer){
                currentUser.score += this.score ;
                this.speak(util.format("That's right, %s, the correct answer was %s ",from, this.currentQuestion.answer) );
                this.queueQuestion(false);
            }
            break;
        case "abc":
            //multiple choice
            if (this.currentQuestion.answer.toLowerCase() == answer){
                currentUser.score += this.score;
                this.speak(util.format("That's right, %s, the correct answer was %s ",from, answer));
                this.queueQuestion(false);
            }
            break;
        default:
            //open, could be more than 1 answer required
            if (this.currentQuestion.answer.indexOf(answer) != -1 && this.currentAnswers.indexOf(answer) == -1 ){
                currentUser.score += this.score;
                this.currentAnswers.push(answer);
                this.answerCount--;
                if (this.answerCount == 0){
                    this.speak(util.format("%s was the last correct answer was I was looking for %s ", answer, from));
                    this.queueQuestion(false);
                } else {
                    this.speak(util.format("%s is a correct answer, %s ", answer, from));
                    this.speak(util.format("%s answers remaining.", this.answerCount) )
                }
            }
            break;
    }
}

Trivia.prototype.printTotalScores = function(){
    var that = this;
    var a = this.users.users.sort(function(a,b){ return that.users.getUser(a).total - that.users.getUser(b).total; });
    var n = a.pop();
    this.speak("And here are the overall scores:")
    while (n !== undefined){
        this.speak(util.format("    %s - %s", this.users.getUser(n).total, n));
        n = a.pop();
    }
}

Trivia.prototype.speak = function(message){
    this.bot.say(this.channel, message);
}

exports.unload = function() {
    delete require.cache[require.resolve('./questions.js')];
    delete require.cache[require.resolve('./users.js')];
}
exports.Trivia = Trivia;

