"use strict";

var fs = require('fs');
var q = require('../../quote.js');

var quotes  =  q.quotes();

function getQuote(id) {
	for(var i = 0, l = quotes.length; i < l; i++) {
		var q = quotes[i];

		if(q.id == id) {
      return q;
    }
	}

	return false;
}

exports.getid = function(req, res) {
	var q = getQuote(req.params.id);
	var qa = [q];
  res.render('quotelist', { quotes : qa , title : 'Quote #' + req.params.id});
};

exports.get = function(req, res) {
  var q = quotes.sort(function(a,b) { return b.points - a.points; });

  res.render('quotelist', { quotes : q , title : 'Quote list'});
};
