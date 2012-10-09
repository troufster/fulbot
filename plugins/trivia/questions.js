var util = require('util');
var fs = require("fs");
var triviaList = "./resources/trivia/trivia.txt";

function read(file){
        if (fs.existsSync(file) ) {
            return JSON.parse(fs.readFileSync(file));
        }
        return {};
}
function Questions(){
    this.questions = read(triviaList);
}

Questions.prototype.total = function(){
    var t = 0;
    for (var question in this.questions){
        t += this.questions[question].length;
    }
    return t;
}

module.exports = Questions;