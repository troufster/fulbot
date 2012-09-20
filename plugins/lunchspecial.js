
function sayFoodCT(bot, from, to, message) {
    bot.say(to, "chang-thai");
}

exports.listener = function(){
    return {
          name : '!foodzor randomizer special',
              match : /\!Iunch/i,
                  func : sayFoodCT,
                      listen : ["chan"]
                        }
};
