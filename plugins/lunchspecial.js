
function sayFoodCT(bot, from, to, message) {
    bot.say(to, "chang-thai");
}

exports.listeners = function(){
    return [{
        name : '!foodzor randomizer special',
        match : /\!Iunch/i,
        func : sayFoodCT,
        listen : ["#sogeti"]
    }];
};