"use strict";

function rnd(range) {
  return Math.floor(Math.random()*range) +1;
}

function clamp(val, max) {
  return Math.min(Math.max(val, 0), max);
};

function offset(word, coords) {
  var keyboard = [
      ['§', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '´'], //0
      ['q' , 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'å', '¨'], //1
      ['a' , 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', "'"], //2
      ['<', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-', '-',  '-']  //3
  ];  
  
  var ybound = 3;
  var xbound = 13;
    
  var reverse = {
      '§' : [0,0], '1' : [0,1], '2' : [0,2], '3' : [0,3], '4' : [0,4], 
      '5' : [0,5], '6' : [0,6], '7' : [0,7], '8' : [0,8], '9' : [0,9], 
      '0' : [0,10], '+' : [0,11], '´' : [0,12], 
      //Next row
      //Blank 0
      'q' : [1,1], 'w' : [1,2], 'e' : [1,3], 'r' : [1,4], 't' : [1,5], 
      'y' : [1,6], 'u' : [1,7], 'i' : [1,8], 'o' : [1,9], 'p' : [1,10], 
      'å' : [1,11], '¨' : [1,12],
      //next row
      //blank 0
      'a' : [2,1], 's' : [2,2], 'd' : [2,3], 'f' : [2,4], 'g' : [2,5], 
      'h' : [2,6], 'j' : [2,7], 'k' : [2,8], 'l' : [2,9], 'ö' : [2,10], 
      'ä' : [2,11], "'" : [2,12],
      //next row
      '<' : [3,0], 'z' : [3,1], 'x' : [3,2], 'c' : [3,3], 'v' : [3,4], 
      'b' : [3,5], 'n' : [3,6], 'm' : [3,7], ',' : [3,8], '.' : [3,9], 
      '-' : [3,10]
      //blank 11
      //blank 12
  };
    
    var out= "";
    
    for(var i = 0, l = word.length; i < l; i++) {
        var char = word[i];
        
        //Map char
        var position = reverse[char];

        //No reverse map found
        if(!position) {
            out += char;
            continue;
        }
        
        //xy get flipped here
        var off = [ position[0] + coords[1],position[1] + coords[0] ];        

        //Clamp coordinates to keyboard bounds
        off = [clamp(off[0],ybound), clamp(off[1], xbound)];
        
        //Add offset char to out
        out+=keyboard[off[0]][off[1]];        
    }
    
    return out;
}


function bjornzorize(text) {
  var words = text.split(" ");
  //console.log(words);
  var bjornifiedWords = [];

  var vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'å', 'ä', 'ö' ];
  var extraChars = ['\'', '´', '`', 'l', 'ö', 'ä', '"'];

    
  for(var i = 0, il = words.length; i < il; i++) {
    var word = words[i];

    var bjornWord = word;                      
      
    for(var j = 0, jl = word.length; j < jl; j++){
    
      var offsetError = rnd(10) === 1;
        
      if(offsetError) {
          var direction = (rnd(2) === 1) ? -1 : 1;      
          
          var off = offset(word[j], [direction,0]);
          
          //replace in word
           var stringBuilder = bjornWord.split('');
           stringBuilder[j] = off;        
           bjornWord = stringBuilder.join('');
      }
        
      var flip = rnd(20) === 1;
      if(flip && j < jl) {
        var letterA = bjornWord[j];
        var letterB = bjornWord[j+1];

        var stringBuilder = bjornWord.split('');
        stringBuilder[j] = letterB;
        stringBuilder[j+1] = letterA;
        bjornWord = stringBuilder.join('');
        break;
      }

    }

    var vowelsToRemove = [];
    var wordCopy = bjornWord.split('');
    //console.log(word);
    for(var k = 0, kl = word.length; k < kl; k++) {

      if((vowels.indexOf(bjornWord.toLowerCase()[k]) > -1) && rnd(8) === 1) {

        if(vowelsToRemove.indexOf(k) === -1) {
          vowelsToRemove.push(k);
        }

      }

    }

    if(vowelsToRemove.length > 0) {

      for(var vowelIndex in vowelsToRemove) {
        if (vowelsToRemove.hasOwnProperty(vowelIndex)){
          wordCopy[vowelsToRemove[vowelIndex]] = '';			}
        }

      bjornWord = wordCopy.join('');
    }

    if(rnd(5) === 1) {
      bjornWord += extraChars[rnd(extraChars.length-1)];
    }

    bjornifiedWords.push(bjornWord);
  }

  return bjornifiedWords.join(' ');

}

function sayHello(bot, from, to, message) {

  var parts = message.split(" ");

  var rest = parts.slice(1,parts.length).join(" ");

  bot.say(to, bjornzorize(rest));
}

exports.listeners = function(){
  return [{
    name : '!bzor listener',
    match : /^!bzor/i,
    func : sayHello,
    listen : ["#sogeti", "#botdev", "priv"]
  }];
};
