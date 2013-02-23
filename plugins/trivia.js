"use strict";
var util = require('util');

var Trivia = require("./trivia/trivia.js").Trivia;

var tt = null;

function answer(bot, from, to, message){
  if (tt === null || !tt.Running()) {
    return;
  }
  tt.giveAnswer(from, message.replace('@',''));
}

function trivia(bot, from, to, message){
  if (tt === null){
    tt = new Trivia(bot, to);
  }

  var parts = message.split(' ');
  parts.splice(0,1);
  var command = parts[0];

  switch(command)
  {
    case "play":
      if (parts.length > 1){
        tt.newRound(parts[1]);
      } else {
        tt.newRound();
      }
      break;
    case "pass":
      if (tt.Running()) {
        tt.pass(from);
      }
      break;
    case "scores":
      tt.printTotalScores();
      break;
    case "help":
      if (parts.length === 1){
          help(to);
      } else {
        help(to, parts[1]);
      }

      break;
    case "add":
      parts.splice(0,1);
      var p = parts.join(' ').split('||');

      try {
      var answers = JSON.parse(p[2]);

      tt.addQuestion(p[0],p[1],answers,p[3] );
      }
      catch(err) {
      bot.say(to, err);
      }
      break;
  }

function help(to, subject){
  if (subject === "" || subject === undefined){
    bot.say(to,"trivia accepts the following command:\n   play\n   scores\n   pass\n   add");
    return;
  }

  switch(subject){
    case "play":
      bot.say(to,"Start a new round with 10 trivia questions, if no round is already started." +
        "\n Additionally one can provide a category so only question from that category are chosen.");
      break;
    case "scores":
      bot.say(to,"Display the total scores of all players.");
      break;
    case "pass":
      bot.say(to,"You pass on the question, when every active player has passed, a new question will be presented.");
      break;
    case "add":
      bot.say(to,"Add a new question.\nFormat: category||question||[answer(s)]||type\n"+
        "    category is any new or existing category\n" +
        "    question is the actual question\n" +
        "    answer is an array of anser(s) that are accepted\n" +
        "    type is one of the following: a number, *, abc; \n" +
        "       - a number: n answers are required, scoring for each correct one\n" +
        "       - *       : a scramble question, question should the answer with the characters in a random order\n" +
        "       - abc     : a multiple choice question, answer is a or b or ... or z \n"
      );
      break;
    default:
      bot.say(to,"trivia accepts the following command:\n   play\n   scores\n   pass\n   add");
      break;
  }


}
}


exports.listeners = function(){return [{
  name : "trivia",
  match : /^\!trivia/i,
  func : trivia,
  listen : ["#games"]
  }, {
  name : "trivia",
  match : /[^!].*/,
  func : answer,
  listen : ["#games"]
  }];
};