
function Utils(){
    this.bot = null;
}

Utils.prototype.init = function(bot) {
    this.bot = bot;
};

Utils.prototype.isUserOperator = function(channel, nick){
    return this.bot.chans[channel].users[nick].indexOf("@") > -1;
};

Utils.prototype.isUserOnChannel = function(channel, nick){
    return this.bot.chans[channel].users[nick] !== undefined;
};

Utils.isChanMessage = function(to) {
  return !!(to.match(/^[#&]/));
};

Utils.prototype.canSpeak = function(channel) {
  
  //Assume we can speak to users
  if(!Utils.isChanMessage(channel)) return true;

  var isChanModerated = this.bot.chans[channel].mode.indexOf('m') > -1;
  var haveVoice = this.bot.chans[channel].users[this.bot.nick].indexOf('+') > -1;

  return !isChanModerated || haveVoice;
};



exports.Utils = Utils;
