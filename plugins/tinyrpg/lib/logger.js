var colors = require('colors');
var sys = require('sys');


var logLevel = {
  'DEBUG' : 0,
  'NOTICE' : 5,
  'WARN' : 1,
  'ERROR' : 2,
  'FATAL' : 3,
  'MELTDOWN': 4
};


function puts(val) {
  sys.puts(val);
}

var logger = {
  logLevel : logLevel,
  log : function(level, value) {
    switch(level) {
      case logLevel.DEBUG:
        puts('DEBUG : '.bold + value.bold);
        break;
      case logLevel.NOTICE:
        puts('NOTICE : '.green.bold + value.green.bold);
        break;
      case logLevel.WARN:
        puts('WARN : '.cyan.bold + value.cyan.bold);
        break;
      case logLevel.ERROR:
        puts('ERROR : '.yellow.bold + value.yellow.bold);
        break;
      case logLevel.FATAL:
        puts('FATAL : '.red.bold  + value.red.bold);
        break;
      case logLevel.MELTDOWN:
        puts('MELTDOWN : '.rainbow.bold + value.rainbow.bold);
        break;
      default:
        break;
    }
  }  
};

module.exports = logger;
