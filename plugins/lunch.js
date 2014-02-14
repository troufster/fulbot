var foodzors = [
  "chang-thai!!!",
  "kebabhouse",
  "charken",
  "gula huset",
  "NH",
  "cupolenburgare",
  "tacobar",
  "cloetta center",
  "marcus pizzeria",
  "texas",
  "konsert & kongress",
  "hagdahls",
  "ghingis",
  "matkällaren"
];

function sayFood(bot, from, to, message) {
  bot.say(to, foodzors[Math.floor(Math.random() * foodzors.length)]);
}

exports.listeners = function(){
    return [{
        name : '!foodzor randomizer',
        match : /\!lunch/i,
        func : sayFood,
        listen : ["#sogeti", "priv"]
    }];
};
