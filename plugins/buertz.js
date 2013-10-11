/* jshint node: true */
"use strict";
var fs = require('fs'),
Admin = require("./buertz/buertzAdmin.js"),
configMixin = require('../resourceManager.js').mixin;


var buertzList = 'Öl.txt';

var admin = null;

function Buertz (){
  var self = this;
  var buertzors = [];

  function randomBuertz(cb, ftr, filterparameters) {
    if (buertzors.length === 0){
      refresh(cb);
      cb(null, 'inga buertz än, vänta nån sekund...');
      return;
    }
    var useFilter = false;
    var filtered = [];

    if (ftr !== undefined){
      ftr = ftr.toLowerCase();
      if (ftr.indexOf("sek") === -1 )
      {
        filtered = buertzors.filter(
          function (element) {
            return (parseFloat(element.Alkoholhalt[0].replace('%','')) >= ftr);
          }
        );
        useFilter = true;
      } else {
        filtered = buertzors.filter(
          function (element) {
            return (parseFloat(element.Prisinklmoms[0]) <= parseFloat(filterparameters));
          }
        );
        useFilter = true;
      }
    }

    var data = "";
    for (var i = 0; i < 5; i++) {

      var buertz = null;
      if (useFilter && filtered.length !== 0){
        buertz = filtered[Math.floor(Math.random() * filtered.length)];
      }
      else {
        buertz = buertzors[Math.floor(Math.random() * buertzors.length)];
      }
      data += buertz.Namn + ' ' + (typeof buertz.Namn2[0] === "string" ? buertz.Namn2[0] : '')  +  ' , ' + buertz.Alkoholhalt + ' , SEK ' + buertz.Prisinklmoms[0].substr(0,buertz.Prisinklmoms[0].length -1) + ' (' + buertz.Volymiml + 'ml) \n';
    }
    cb(null,data);
  }

  function refresh(cb){
    if (admin === null){
      admin = new Admin();

      admin.emitter.on('refreshed',function(){
        load(cb);
      });
    }
    admin.refresh(cb);
  }

  function load(cb){
    self.load('buertz', buertzList, function (err, data) {
      if (err) {
        throw err;
      }
      buertzors = data;
      cb(null,'nu finns det buertz');
    });
  }



  function info(cb,name){
    if (buertzors.length === 0){
      refresh(cb);
      cb(null, 'inga buertz än, vänta nån sekund...');
      return;
    }

    name = name.toLowerCase();
    var b =  buertzors.filter(
      function (element) {
        return (element.Namn[0].toLowerCase().indexOf(name) > -1 );
      }
    );
    var data = "";

    if (b.length === 1) {
      for (var i = b.length -1; i>=0;i--) {
        if (data !== "" ) {
          data += "\n";
        }
        data += b[i].Namn + ' ' + (typeof b[i].Namn2[0] === "string" ? b[i].Namn2[0] : '')  ;
        data += '\n  Alkohol halt: ' + b[i].Alkoholhalt ;
        data += '\n  Typ     : ' + b[i].Varugrupp[0].substr(4);
        data += '\n  Pris    : ' + b[i].Prisinklmoms[0].substr(0,b[i].Prisinklmoms[0].length -1);
        data += '\n  nr      : ' + b[i].Varnummer;
        data += '\n  Förpackning : ' + b[i].Volymiml + 'ml ' + b[i].Forpackning;
        data += '\n  Producent   : ' + b[i].Producent;
        data += '\n  Leverantör  : ' + b[i].Leverantor;
        data += '\n  Sälj start  : ' + b[i].Saljstart;
      }
      cb(null,data);
    } else if(b.length > 1){
      for (var n = b.length -1; n>=0;n--){
        data += b[n].Namn + ' ' + (typeof b[n].Namn2[0] === "string" ? b[n].Namn2[0] : '') + '\n' ;
      }
      cb(null,data);
    }
  }

  function hangman(cb){
    if (buertzors.length === 0){
      cb(null,'burpaderp');
      return;
    }
    var list = "";
    buertzors.forEach(function(beer){
      var n = beer.Namn +  (typeof beer.Namn2[0] === "string" ? ' ' + beer.Namn2[0] : '');
      if (list === ""){
        list = n.replace(',','') ;
      }else{
        list += ',' +  n.replace(',','') ;
      }
    });

    fs.open('./resources/hangman/öl.txt', 'w', 666, function(err, fd) {
      if(err) {
        throw err;
      }

      fs.write(fd,  list, null, undefined, function(err, written) {
        fs.close(fd, function(){
          cb(null, 'hangman file saved, ' + written + ' bytes written');
        });
      });
    });
  }

  this.sayBeer = function(bot, from, to, message)
  {
    var parts = message.split(" ");
    var command = parts[1];
    var rest = parts.slice(2,parts.length).join(" ");


    var callback = function(err, d) {
      if(err) {
        throw err ;
      }
      bot.say(to, d);
    };

    var callbackPriv = function(err, d) {
      if(err) {
        throw err ;
      }
      bot.say(from, d);
    };


    switch(command) {

      case "refresh":
        refresh(callback);
        break;
      case "info":
        info(callbackPriv, rest);
        break;
      case "hangman":
        hangman(callback);
        break;
      case "help":
        callbackPriv(null,'!BUERTZ!');
        callbackPriv(null,'utan command slumpas 5 öl, ange en siffra för alkohol halten som skall överstigas...');
        callbackPriv(null,'BUERTZ commands: ');
        callbackPriv(null,'   refresh: Hämtar ny lista för tornby från systemets hemsida. ');
        callbackPriv(null,'   info [namn]: Ger extra info om ölet. [namn] = namnet.');
        callbackPriv(null,'        Systemet hanterar dock 2 fält, så får man ingen träff på:');
        callbackPriv(null,'           !buertz info Paulaner Münchener Hell');
        callbackPriv(null,'        borde man söka på: ');
        callbackPriv(null,'           !buertz info Paulaner');
        callbackPriv(null,'!BUERTZ!');
        break;
      default :
        randomBuertz(callback, command, rest);
        break;
    }

  };
}

configMixin(Buertz);

var buertz = new Buertz();

exports.listeners = function(){
  return [{
    name : 'Buertz',
    match : /^!buertz/i,
    func : buertz.sayBeer,
    listen : ["#botdev", "priv"]
  }];
};

