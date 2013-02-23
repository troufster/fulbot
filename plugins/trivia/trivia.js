"use strict";
var util = require('util');
var fs = require("fs");

var Questions = require('./questions.js');
var Users = require('./users.js');
var Utils = require('./../../utils.js').Utils;

function Trivia(b, c){
  var bot = b;
  var channel = c;
  var questions = new Questions();
  var users = new Users();

  var currentQuestion = null;
  var roundQuestions = null;

  var currentAnswers = [];
  var answerCount = 0;  
  var hintedAnswer = null;
  var score = 0;
  
  var timeouts = [];
  var players = [];


  var running = false;
  var utils = new Utils();
  utils.init(bot);

  /* privates */
  var removeTimeouts = function(){
    for(var i = timeouts.length-1;i>=0;i--)
    {
      clearTimeout(timeouts[i]);
      timeouts.pop();
    }
  };

  var queueQuestion = function(s){
    removeTimeouts();
    currentAnswers = [];


    if (s){
      speak(util.format("the correct answer was: %s. No points awarded", currentQuestion.answer));
    }
    currentQuestion = null;
    if (roundQuestions.length > 0) {
      speak( "The next question start in: 5");
      timeouts.push(setTimeout(function(){speak( "The next question start in: 1");}, 4000));
      timeouts.push(setTimeout(function(){nextQuestion();}, 5000));
    } else {
      roundFinished();
    }
  };

  var nextQuestion = function(){
    if (roundQuestions.length > 0) {
      score = 90;
      currentQuestion = roundQuestions.pop();
      console.log(currentQuestion.answer);
      switch(currentQuestion.type){
        case "*":
          //unscramble
          speak(util.format("\x030,12 What word am I looking for: \x03%s ", currentQuestion.question) );
          break;
        case "abc":
          //multiple choice
          var t = currentQuestion.question;
          var a = currentQuestion.choice.reverse();
          for(var i = a.length-1;i>= 0; i--){
            t += " " + a[i];
          }
          speak(t);
          break;
        default:
          //open, could be more than 1 answer required
          speak(util.format("\x030,12 %s \x03",currentQuestion.question ));
          answerCount = parseInt(currentQuestion.type, 10);
          if (answerCount === 1){
            hintedAnswer = currentQuestion.answer[0].replace(/[^. ]/g,'*');
            speak(util.format("  %s", hintedAnswer) );

            timeouts.push(setTimeout(function(){hint(30);}, 15000));
            timeouts.push(setTimeout(function(){hint(15);}, 30000));
          }
          break;
      }
      timeouts.push(setTimeout(function(){queueQuestion(true);}, 45000));
    }
  };

  var hint = function(s){
    score -= 30;

    var c = hintedAnswer.split('*').length-1;

    for (var i = Math.floor(c/3); i>=0; i--){
      var rand = Math.floor(Math.random() * hintedAnswer.length);
      var n = currentQuestion.answer[0][rand];
      if (n !== " "){
        var t = hintedAnswer.split('');
        t.splice(rand,1,n);
        hintedAnswer = t.join('');
      } else
      {
        i++;
      }
    }
    speak(util.format("\x038,12 %s\x03\x030,12 seconds remaining, points remaining: \x03\x038,12%s\x03", s, score) );
    speak(util.format("  %s", hintedAnswer) );
  };

  var roundFinished = function(){
    removeTimeouts();

    printAndUpdateScores();
    currentQuestion = null;
    roundQuestions = null;
    running = false;
    users.save();
  };

  var speak = function(message){
    bot.say(channel, message);
  };

  var printAndUpdateScores = function(){
    var sortedList = players.sort(function(a,b){ return users.getUser(b).score - users.getUser(a).score; });
    speak("And here are the scores for this round:");
    for (var i = sortedList.length-1; i >=0; i--){
        var player = users.getUser(sortedList[i]);
        speak(util.format("  %s - %s", player.score, player.name));

        player.total+= player.score;
        player.rounds++;
        player.score = 0;
        player.passed = false;
    }
  };

  /* public */
  /**
   * @returns {bool} whether trivia is started or not.
   */
  this.Running = function(){
    return running;
  };

  this.Categories = function(){
    var categories = questions.categories();
    categories.forEach(function(category){
      speak(util.format("%s \n", category));
    });
  };

  this.pass = function(u){
    if (currentQuestion === null) {
      return;
    }
    if (players.indexOf(u) === -1 ) {
      players.push(u);
    }
    var currentUser = users.getUser(u);

    currentUser.passed = true;

    var b = true;

    for(var p in players){
      if (players.hasOwnProperty(p)){
        currentUser = users.getUser(players[p]);
        b = b & currentUser.passed;
      }
    }
    if (b){
      queueQuestion(true);
    }
  };

  this.printTotalScores = function(){
    var a = users.users;//.sort(function(a,b){ return users.getUser(a).total - users.getUser(b).total; });
    speak("And here are the overall scores:");
    for (var user in users.users){
      if(users.users.hasOwnProperty(user)){
        speak(util.format("  %s - %s", users.getUser(user).name, users.getUser(user).total));
      }
    }
  };

  this.giveAnswer = function(from, answer){
    if (currentQuestion === null) {
      return;
    }

    if (players.indexOf(from) === -1 ){
      players.push(from);
    }

    var currentUser = users.getUser(from);

    answer = answer.toLowerCase();
    switch(currentQuestion.type){

      case "*":
        //unscramble
          if (currentQuestion.answer === answer.toLowerCase()){
          currentUser.score += score ;
          speak(util.format("That's right, %s, the correct answer was %s ",from, currentQuestion.answer) );
          queueQuestion(false);
        }
        break;
      case "abc":
        //multiple choice
        if (currentQuestion.answer.toLowerCase() === answer){
          currentUser.score += score;
          speak(util.format("That's right, %s, the correct answer was %s ",from, answer));
          queueQuestion(false);
        }
        break;
      default:
        //open, could be more than 1 answer required
        if (currentQuestion.answer.indexOf(answer) !== -1 && currentAnswers.indexOf(answer) === -1 ){
          currentUser.score += score;
          currentAnswers.push(answer);
          answerCount--;
          if (answerCount === 0){
            speak(util.format("%s was the last correct answer was I was looking for %s ", answer, from));
            queueQuestion(false);
          } else {
            speak(util.format("%s is a correct answer, %s ", answer, from));
            speak(util.format("%s answers remaining.", answerCount) );
          }
        }
        break;
    }
  };


  this.newRound = function(category){
    if (running) {
      speak("There is already a round in progress");
      return;
    }

    roundQuestions = [];
    timeouts = [];
    players = [];
    currentQuestion = -1;
    var i = 0;
    while(roundQuestions.length < 10 && i < 10){
      var q = questions.random(category);
      if (roundQuestions.indexOf(q) === -1){
        roundQuestions.push(q);
      }
      else {
        i++;
      }
    }

    for(var user in users){
      if(users.hasOwnProperty(user)) {
        user.score = 0;
      }
    }
//  var l = this.utils.users(channel);
//  var t = "";
//  for(var u in l){
//    t += u + ", ";
//  }

    speak(util.format("A new round has begun"));
    running = true;
    queueQuestion(false);
  };



  this.addQuestion =function(category, question, answer, type){
    questions.newQuestion(category, question, answer, type);
  };

  speak(util.format("I've got 99 problems but these %s questions ain't one.\n Write !trivia play to start a new round, !trivia pass to pass on a question, @<answer> to answer a question.", questions.total()));
}








exports.unload = function() {
  delete require.cache[require.resolve('./questions.js')];
  delete require.cache[require.resolve('./users.js')];
};
exports.Trivia = Trivia;

