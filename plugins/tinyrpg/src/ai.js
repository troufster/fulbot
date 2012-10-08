var Dice = require('../src/dice');
var Messages = require('./messages');
var Dispatcher = require('../lib/dispatcher');

var AI = {
  Attack: function(agent) {
    if(agent.Target) {      
      agent.Hit();
    }
  },
  
  Idle: function(agent) {
    var val = Dice.DX(500);
      if(val < 2) {
        Messages.Idle.Random({ actor : agent.Name});
      }
  },
  None : function() {},
  Dead : function(agent) {

  }
};
          

var AIProfiles = {}

//["State", "Entry", "Exit", [func, "State"], trans, trans]
AIProfiles["Generic"] = {
      'Attack' : [AI.Attack, AI.None, AI.None,[function(actor) { return (actor.HP <= 0);}, 'Dead']],
      'Idle' : [AI.Idle, AI.None, AI.None, []],
      'Dead' : [AI.None, AI.None, AI.None, []]
};


 module.exports = AIProfiles;