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
    fs.open(file, 'w', 0666,
        function(err, fd) {
            if(err) return;
            fs.write(fd,  JSON.stringify(json), null, undefined, function(err, written) {});
        }
    );
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

Questions.prototype.random = function(category){
    var q = null;
    if (category == null){
        var categories = Object.keys(this.questions);
        var rc = Math.floor(Math.random() * categories.length);
        c = this.questions[categories[rc]];
    } else {
        c = this.questions[category];
    }

    var rq = Math.floor(Math.random() * c.length);
    return c[rq];
}



module.exports = Questions;