"use strict";
var util = require('util');
var fs = require("fs");
var userList = "./resources/trivia/triviausers.txt";

function read(file){
    if (fs.existsSync(file) ) {
        return JSON.parse(fs.readFileSync(file));
    }
        return {};
}

function write(file, j){
    fs.open(file, 'w', 666, function(err, fd) {
        if(err) {
          throw err;
        }
        fs.write(fd,  JSON.stringify(j), null, undefined, function(err, written) {
          if(err) {
            throw err;
          }
        });
    });
}

function Users(){
    this.users = read(userList );
}

Users.prototype.save = function(){
    write(userList, this.users);
};

Users.prototype.getUser = function(n){
    if (this.users[n] === undefined){
        return this.newUser(n);
    }
    return this.users[n];
};

Users.prototype.newUser = function(n){
    var user = {
        name:n,
        rounds:0, //rounds played
        total:0,  //total score
        score:0   //current rounds score
    };

    this.users[n] = user;
    return user;
};


module.exports = Users;