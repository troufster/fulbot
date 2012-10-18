var utils = require ('./../../../utils.js').Utils;

function Identity(identity, pass){
    this.ident = identity;
    this.pass = pass;
    this.hosts = [];
}

function Op(bot){
    this.bot = bot;

    this.utils = new utils();
    this.utils.init(this.bot);

    this.ops   = [];
    this.deops = [];
    this.identities = [];

    var that = this;
    this.bot.addListener("join", function(channel, user, message) {
        if (that.ops[channel] && that.ops[channel].indexOf(user) > -1){
            that.op(channel, that.bot.opt.nick, user, message );
        }
    });
    this.bot.addListener("+mode", function(from, nick, mode, user, message) {
        that.checkSetOp(from, nick, mode, user, message);
    });
    this.bot.addListener("-mode", function(from, nick, mode, user, message) {
        that.checkRemoveOp(from, nick, mode, user, message);
    });
}

Op.prototype.op= function(channel,from, user, message){
    if (this.utils.isUserOperator(channel,from)){
        this.bot.send("MODE " + channel + " +o " + user );
    } else {
        this.bot.say("Oy! You no op, boy!");
    }

}


Op.prototype.checkRemoveOp = function(from, nick, mode, user, message){

}

Op.prototype.checkSetOp = function(from, nick, mode, user, message){

}

Op.prototype.addOp = function(channel, user, message, raw){
    if(!this.ops[channel]){
        this.ops[channel] = [];
    }

    if(!this.deops[channel]){
        this.deops[channel] = [];
    }


    if(this.ops[channel].indexOf(user) == -1 && this.deops[channel].indexOf(user) ==-1 ){
        this.ops[channel].push(user);
    }

    this.setOp(channel, user, raw)

};

Op.prototype.deop = function(channel, user, hostmask){
    if(!this.deops[channel]){
        this.deops[channel] = [];
    }

    if(!this.ops[channel]){
        this.ops[channel] = [];
    }

    if(this.deops[channel].indexOf(hostmask) == -1 && this.ops[channel].indexOf(hostmask) == -1 ){
        this.deops[channel].push(hostmask);
    }
}

Op.prototype.ident = function (to, handle, pass, raw) {

    var valid = this.identities.some(function(identity) {
        return identity.ident == handle && identity.pass == pass;
    });


    if (valid){
        var identity = this.identities.some(function(identity) {
            if (identity.ident == handle && identity.pass == pass)
                return identity;
        });

        if (identity.hosts.indexOf(raw.prefix) == -1){
            identity.hosts.push(raw.prefix);
        }
        this.bot.say(to, "Hi");
        return true;
    }

    var identity = this.identities.some(function(identity) {
        if (identity.ident == handle)
            return identity;
    });

    if (!identity) {

        var exists = this.identities.some(function(identity) {
            return identity.hosts.some(function(host){
                return host == raw.prefix;
            })
        });

        if (!exists) {
            var identity = new Identity(handle, pass);
            identity.hosts.push(raw.prefix);
            this.identities.push(identity);

            this.bot.say(to, "Your handle is now registered.")
            return true;
        }

        this.bot.say(to, "you're already registered under a different handle");
        return false;
    }
    this.bot.say(to, "Y U NO VALID HANDLE/PASS!!!");
    return false;
}

Op.prototype.hello = function(to, raw){

    this.bot.say(to,"hmmm, I see what you did there..");

}

module.exports = Op;