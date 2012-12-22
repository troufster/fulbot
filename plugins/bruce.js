var Op = require('./bruce/src/op');


var op = null;


function mainDrop(bot, from, to, message, raw) {
    if (op == null){
        op = new Op(bot);


        op.bot.addListener('notice',function(from, to, message, raw){
            mainDrop(null, from, to, message, raw);
        });
    }

    var m = message.split(' ');

    if (!m) return;

    switch(m[0].toLowerCase()){
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
        case "operators":
            op.operators(m[1],to);
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