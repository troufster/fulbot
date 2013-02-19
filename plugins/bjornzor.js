
function rnd(range) {
  return Math.floor(Math.random()*range) +1;
}

function bjornzorize(text) {

  var ret = "";
  var words = text.split(" ");
  //console.log(words);
  var bjornifiedWords = [];

  var vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'å', 'ä', 'ö' ];
  var extraChars = ['\'', '´', '`', 'l', 'ö', 'ä', '"'];

  for(var i = 0, il = words.length; i < il; i++) {
    var word = words[i];

    var bjornWord = word;

    for(var j = 0, jl = word.length; j < jl; j++){

      var flip = rnd(20) == 1;
      if(flip && j < jl) {
        var letterA = word[j];
        var randomIndex = rnd(jl);
        var letterB = word[j+1];

        var stringBuilder = bjornWord.split('');
        stringBuilder[j] = letterB;
        stringBuilder[j+1] = letterA;
        bjornWord = stringBuilder.join('');

      }

    }

    var vowelsToRemove = [];
    var wordCopy = bjornWord.split('');
    //console.log(word);
    for(var k = 0, kl = word.length; k < kl; k++) {

      if((vowels.indexOf(bjornWord.toLowerCase()[k]) > -1) && rnd(8) == 1) {

        if(vowelsToRemove.indexOf(k) == -1) {
          vowelsToRemove.push(k);
        }

      }

    }

    if(vowelsToRemove.length > 0) {

      for(var vowelIndex in vowelsToRemove) {
        wordCopy[vowelsToRemove[vowelIndex]] = '';			}

      //console.log(wordCopy, vowelsToRemove);
      bjornWord = wordCopy.join('');
    }

    if(rnd(5) == 1) {
      var extraChar = extraChars[rnd(extraChars.length-1)];
      bjornWord += extraChar;
    }

    bjornifiedWords.push(bjornWord);
  }

  return bjornifiedWords.join(' ');

}

function sayHello(bot, from, to, message) {

  var parts = message.split(" ");

  var command = parts[0];

  var rest = parts.slice(1,parts.length).join(" ");;

  bot.say(to, bjornzorize(rest));
}

exports.listeners = function(){
  return [{
    name : '!bzor listener',
    match : /^\!bzor/i,
    func : sayHello,
    listen : ["#sogeti", "#botdev", "priv"]
  }];
};