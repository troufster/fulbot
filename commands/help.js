

function doHelp(bot, from, to, message) {
  var str = "Hello stupid.\n What's up?";
}

exports.listeners = function(){
  return [{
    name : 'help',
    desc : 'Shows some stupid text',
    func : doHelp
  }];
};