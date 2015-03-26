var conf = require("../conf");
var NickServ = require('nickserv');

function registerNick(bot, message){
    var nickserv = new NickServ(conf.nick);
    nickserv.attach('irc', bot);

    nickserv.register(conf.password, conf.email, function(err){
        if(err && err.type === 'alreadyRegistered') {
            nickserv.identify(conf.password, function (err) {
                if (err)console.log(err)
            })
        }
    });
}

exports.listeners = function(){
    return [{
        name : "registered listener",
        command : 'registered',
        func : registerNick,
        listen: ['server']
    }]
};