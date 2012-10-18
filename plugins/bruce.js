var Op = require('./bruce/src/op');


var op = null;


function mainDrop(bot, from, to, message, raw) {
    if (op == null){
        op = new Op(bot);
    }

    var m = message.split(' ');

    if (!m) return;

    switch(m[0]){
        case "op":
            op.op(m[1], from, m[2], message, raw );
            break;
        case "deop":
            break;
        case "ident":
            op.ident(to, m[1], m[2], raw);
            break;
        case "hello":
            op.hello(to, raw);
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