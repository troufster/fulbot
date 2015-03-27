"use strict";

let Plugin = require('../../lib/plugin');

const keyboard = [
  ['§', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '´'],
  ['q' , 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'å', '¨'],
  ['a' , 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', "'"],
  ['<', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-', '-',  '-']
];

const ybound = 3;
const xbound = 13;

const reverse = {
  '§' : [0,0], '1' : [0,1], '2' : [0,2], '3' : [0,3], '4' : [0,4],
  '5' : [0,5], '6' : [0,6], '7' : [0,7], '8' : [0,8], '9' : [0,9],
  '0' : [0,10], '+' : [0,11], '´' : [0,12],
  'q' : [1,1], 'w' : [1,2], 'e' : [1,3], 'r' : [1,4], 't' : [1,5],
  'y' : [1,6], 'u' : [1,7], 'i' : [1,8], 'o' : [1,9], 'p' : [1,10],
  'å' : [1,11], '¨' : [1,12],
  'a' : [2,1], 's' : [2,2], 'd' : [2,3], 'f' : [2,4], 'g' : [2,5],
  'h' : [2,6], 'j' : [2,7], 'k' : [2,8], 'l' : [2,9], 'ö' : [2,10],
  'ä' : [2,11], "'" : [2,12],
  '<' : [3,0], 'z' : [3,1], 'x' : [3,2], 'c' : [3,3], 'v' : [3,4],
  'b' : [3,5], 'n' : [3,6], 'm' : [3,7], ',' : [3,8], '.' : [3,9],
  '-' : [3,10]
};

const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'å', 'ä', 'ö' ];
const extraChars = ['\'', '´', '`', 'l', 'ö', 'ä', '"'];

class Bzor extends Plugin {

  get settings() {
    return {
      match : [/^!bzor/i],
      entry : this.bzor,
      resources : false
    }
  }

  offset(word, coords) {
    let out = "";

    for(let char of word) {
      //Map char
      let position = reverse[char];

      //No reverse map found
      if(!position) {
        out += char;
        continue;
      }

      //xy get flipped here
      let off = [ position[0] + coords[1],position[1] + coords[0] ];

      //Clamp coordinates to keyboard bounds
      off = [this.clamp(off[0],ybound), this.clamp(off[1], xbound)];

      //Add offset char to out
      out+=keyboard[off[0]][off[1]];
    }

    return out;
  }

  rnd(range) {
    return Math.floor(Math.random()*range) +1;
  }

  clamp(val, max) {
    return Math.min(Math.max(val, 0), max);
  };

  bjornzorize(text) {
    let words = text.split(" ");
    let bjornifiedWords = [];

    for(let word of words) {
      let bjornWord = word;

      for(let j = 0, jl = word.length; j < jl; j++){

        let offsetError = this.rnd(10) === 1;

        if(offsetError) {
          let direction = (this.rnd(2) === 1) ? -1 : 1;

          let off = this.offset(word[j], [direction,0]);

          //replace in word
          let stringBuilder = bjornWord.split('');
          stringBuilder[j] = off;
          bjornWord = stringBuilder.join('');
        }

        let flip = this.rnd(20) === 1;
        if(flip && j < jl) {
          let letterA = bjornWord[j];
          let letterB = bjornWord[j+1];

          let stringBuilder = bjornWord.split('');
          stringBuilder[j] = letterB;
          stringBuilder[j+1] = letterA;
          bjornWord = stringBuilder.join('');
          break;
        }

      }

      let vowelsToRemove = [];
      let wordCopy = bjornWord.split('');
      //console.log(word);
      for(let k = 0, kl = word.length; k < kl; k++) {

        if((vowels.indexOf(bjornWord.toLowerCase()[k]) > -1) && this.rnd(8) === 1) {

          if(vowelsToRemove.indexOf(k) === -1) {
            vowelsToRemove.push(k);
          }

        }

      }

      if(vowelsToRemove.length > 0) {

        for(let vowelIndex in vowelsToRemove) {
          if (vowelsToRemove.hasOwnProperty(vowelIndex)){
            wordCopy[vowelsToRemove[vowelIndex]] = '';			}
        }

        bjornWord = wordCopy.join('');
      }

      if(this.rnd(5) === 1) {
        bjornWord += extraChars[this.rnd(extraChars.length-1)];
      }

      bjornifiedWords.push(bjornWord);
    }

    return bjornifiedWords.join(' ');

  }

  bzor(message) {
    let parts = message.split(" ");
    let rest = parts.slice(1,parts.length).join(" ");
    return this.bjornzorize(rest);
  }

}

module.exports = Bzor;
