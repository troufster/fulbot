"use strict";
var util = require('util');
var fs = require("fs");
var triviaList = "./resources/trivia/trivia.txt";

function read(file){
    if (fs.existsSync(file) ) {
      return JSON.parse(fs.readFileSync(file));
    }
    return {};
}

function write(file, json){
  fs.open(file, 'w', 666,
    function(err, fd) {
      if(err) {
        throw err;
      }
      fs.write(fd,  JSON.stringify(json), null, undefined, function(err, written) {
        if(err) {
          throw err;
        }
      });
    }
  );
}

function Questions(){
  var questions = read(triviaList);

  this.total = function(){
    var t = 0;
    for (var question in questions){
      if(questions.hasOwnProperty(question)){
        t += questions[question].length;
      }
    }
    return t;
  };

  this.random = function(category){
    var q = null;
    if (category === undefined){
      var categories = Object.keys(questions);
      var rc = Math.floor(Math.random() * categories.length);
      q = questions[categories[rc]];
    } else {
      q = questions[category];
    }

    var rq = Math.floor(Math.random() * q.length);
    return q[rq];
  };

  this.categories = function(){
    var uniqueCategories = [];
    for(var category in questions) {
      if(questions.hasOwnProperty(category)){
        if (uniqueCategories.indexOf(category) === -1)
        {
          uniqueCategories.push(category);
        }
      }
    }
    return uniqueCategories;
  };

  var Question = function(q,a,t){
    this.question = q;
    this.type = t;

    if (t === "*"){
      this.answer = a[0].toLowerCase();
    } else {
      this.answer = a;
    }



    return this;
  };

  this.newQuestion = function(category, q, a, t){
    var question = new Question(q, a, t);

    if(questions[category] === undefined ){
      questions[category] =[];
    }

    questions[category].push(question);
    write(triviaList, questions);
  };
}





module.exports = Questions;