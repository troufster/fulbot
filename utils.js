"use strict";

var Utils = function (){

  this.isUserOperator = function(channel, nick){
    var n = this.chans[channel].users[nick];
    if (n === undefined){return false;}
    return n.indexOf("@") > -1 || n.indexOf("%") > -1 || n.indexOf("~") > -1;
  };

  this.isChanMessage = function(to) {
    return !!(to.match(/^[#&]/));
  };

  this.userList = function(channel) {
    return this.chans[channel].users;
  };

  this.canSpeak = function(channel) {
    //Assume we can speak to users
    if(!this.isChanMessage(channel)) {return true;}

    var isChanModerated = this.chans[channel].mode.indexOf('m') > -1;
    var haveVoice = this.chans[channel].users[this.nick].indexOf('+') > -1;

    return !isChanModerated || haveVoice;
  };

  return this;
};

module.exports = {Utils: Utils};