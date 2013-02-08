
function Utils(){
    this.bot = null;
}

Utils.prototype.init = function(bot) {
    this.bot = bot;
};

Utils.prototype.isUserOperator = function(channel, nick){
    return this.bot.chans[channel].users[nick].indexOf("@") > -1;
};


Utils.isChanMessage = function(to) {
  return !!(to.match(/^[#&]/));
};

Utils.prototype.xmlToJson =
    function (xml) {
        // Create the return object
        var obj = {};

        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            for(var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = Utils.xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].length) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(Utils.xmlToJson(item));
                }
            }
        }
        return obj;
    };

Utils.prototype.canSpeak = function(channel) {
  
  //Assume we can speak to users
  if(!Utils.isChanMessage(channel)) return true;

  var isChanModerated = this.bot.chans[channel].mode.indexOf('m') > -1;
  var haveVoice = this.bot.chans[channel].users[this.bot.nick].indexOf('+') > -1;

  return !isChanModerated || haveVoice;
};



exports.Utils = Utils;
