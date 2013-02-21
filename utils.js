
function Utils(){
    this.bot = null;
}

Utils.prototype.init = function(bot) {
    this.bot = bot;
};

Utils.prototype.isUserOperator = function(channel, nick){
  var n = this.bot.chans[channel].users[nick];

  return n.indexOf("@") > -1 || n.indexOf("%") > -1 ;
};

Utils.prototype.isUserOnChannel = function(channel, nick){
    return this.bot.chans[channel].users[nick] !== undefined;
};

Utils.isChanMessage = function(to) {
  return !!(to.match(/^[#&]/));
};

Utils.isUserOperator = function(bot, channel, nick) {
  var n = bot.chans[channel].users[nick];
  return n.indexOf("@") > -1 || n.indexOf("%") > -1;
};

Utils.userList = function(bot, channel) {
  return bot.chans[channel].users;
};

Utils.prototype.canSpeak = function(channel) {
  
  //Assume we can speak to users
  if(!Utils.isChanMessage(channel)) return true;

  var isChanModerated = this.bot.chans[channel].mode.indexOf('m') > -1;
  var haveVoice = this.bot.chans[channel].users[this.bot.nick].indexOf('+') > -1;

  return !isChanModerated || haveVoice;
};



exports.Utils = Utils;
