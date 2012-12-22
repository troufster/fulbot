var http = require('http'),
fs = require('fs'),
url = require('url'),
util = require('util');

var buertzList = "./resources/buertz/buertz.xml";

var buertzXml;

function loadBuertz(){

fs.readFile(buertzList, function(err, fd) {
if(err) return;
    var rows = fd.toString().split("\n");
    rows = rows.slice(0, rows.length-1);
    var rand = Math.floor(Math.random() * rows.length);
    cb(null, "Quote #" + rand + ": " + rows[rand]);
});

}

function randomBuertz() {


    var number = 0;
//if (number < 10) {

    var artikellista = $(buertzXml).find("artiklar");
//find every Tutorial and print the author
    var artiklar = artikellista.find("artikel");

    var beerlist = new Array();
    var randomBeers = new Array();

    var text = "";
    for (var i = 0; i < artiklar.length; i++) {
        var children = artiklar[i].childNodes;
        var varugrupp = children[10];


        if (varugrupp.textContent.indexOf("Öl") != -1 || varugrupp.textContent.indexOf("öl") != -1 ) {
            beerlist.push(artiklar[i]);
        }

    }
    var randomnumber1 = Math.floor(Math.random() * beerlist.length+1)
    var randomnumber2 = Math.floor(Math.random() * beerlist.length+1)
    var randomnumber3 = Math.floor(Math.random() * beerlist.length+1)
    var randomnumber4 = Math.floor(Math.random() * beerlist.length+1)
    var randomnumber5 = Math.floor(Math.random() * beerlist.length+1)

    randomBeers.push(beerlist[randomnumber1]);
    randomBeers.push(beerlist[randomnumber2]);
    randomBeers.push(beerlist[randomnumber3]);
    randomBeers.push(beerlist[randomnumber4]);
    randomBeers.push(beerlist[randomnumber5]);
    var text = "";
    for (var i = 0; i < randomBeers.length; i++) {


        var randomChilds = randomBeers[i].childNodes;
        var nameItem = randomChilds[3].textContent + " " + randomChilds[4].textContent;

        text = text + nameItem + "<br/>";
    }

    $(".output").append(text);


}


function sayBeer (bot, from, to, message)
{
    var parts = message.split(" ");
    var command = parts[1];
    var rest = parts[2];

    switch(command) {

        case "refresh":
            loadBuertz();
            break;
        default :
            randomBuertz();
            break;
    }

}

exports.listeners = function(){
    return [{
        name : 'Buertz randomizer',
        match : /^\!buertz/i,
        func : sayBeer
    }];
};
