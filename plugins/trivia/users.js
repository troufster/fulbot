var util = require('util');
var fs = require("fs");
var userlist = "./resources/trivia/triviausers.txt";

function read(file){
    fs.exists(file  , function (exists) {
        if (exists) {
            return JSON.parse(fs.readFileSync(file));
        }
        return {};
    });
}

function Users(){
    this.users = read(userlist );
}


module.exports = Users;