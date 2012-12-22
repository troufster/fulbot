
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

exports.Utils = Utils;
