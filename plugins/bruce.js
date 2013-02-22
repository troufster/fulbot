"use strict";
var Operator = require('./bruce/op');


var op = null;


function mainDrop(bot, from, to, message, raw) {
  if (op === null){
    op = new Operator(bot);
    op.bot.addListener('notice',function(from, to, message, raw){
      mainDrop(null, from, to, message, raw);
    });
  }

  var m = message.split(' ');

  if (!m) {return;}

  switch(m[0].toLowerCase()){
    case "mode":
      op.setMode(m[1], to, m[2], m.slice(3, m.length).join(" "), raw );
      break;
    case "op":
      op.op(m[1], to, m[2], raw );
      break;
    case "deop":
      break;
    case "ident":
      op.ident(to, m[1], m[2], raw);
      break;
    case "hello":
    case "yo":
      op.hello(to, raw);
      break;
    case "operators":
      op.operators(m[1],to);
      break;
    default:
      break;
  }
}

exports.listeners = function(){
    return [{
        name : "bruce",
        match : /.+/i,
        func : mainDrop,
        listen : ['priv']
    }];
};