"use strict";

var fs = require('fs');
var configMixin = require('./resourceManager.js').mixin;
var resfile = 'quotes.json';


function Quotefix() {};

//mixin resourceManager
configMixin(Quotefix);

var s = new Quotefix();

fs.readFile("quotes.log", function(err, fd) {

  if(err) {
    return;
  }

  var rows = fd.toString().split("\n");

  rows = rows.slice(0, rows.length-1);

  var quotes = [];

  for(var i = 0, l = rows.length; i < l; i++) {

    var quote = rows[i];

    var q = {
      points : 0,
      text : quote,
      id : i + 1,
      subject : "Quote #" + (i+1)
    };

    quotes.push(q);
  }

  s.save('quotes', resfile, quotes, function (e) {
    if(e) throw e;

    console.log("Done.");
  });
});