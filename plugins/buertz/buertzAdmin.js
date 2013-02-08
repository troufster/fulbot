var http = require('http');

var Utils = require('./../../utils.js').Utils;
var buertzList = "../../resources/buertz/buertz.xml";
var xmlUrl = "http://www.systembolaget.se/Assortment.aspx?butiknr=0504";

function Admin(){
    this.util = new Utils();
    this.utils.init(this.bot);
}

Admin.prototype.refresh = function(){
    http.get(xmlUrl, function(res) {
        console.log("Got response: " + res.statusCode);
    }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });
}

module.exports = Admin;