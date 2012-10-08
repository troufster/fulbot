var Dispatcher = require('../lib/dispatcher');
var Dice = require('./dice');

function emit(type, message) {
  Dispatcher.Emit({ Type: type, Message : message});
}

function randomize(container) {
  return container[Dice.DX(container.length-1)];
}

var data = {
    CombatMiss : ['{0} Misses {1}', '{0} Barely misses {1}', '{0} swings way past {1}']
};

var Messages = {
    Combat : {
      Miss : function(params){
        var str = randomize(data.CombatMiss).format(params.attacker, params.defender);
        emit('combat', str );
      },
      Death : function(params) {
        var str = '{0} deals {1} damage, killing {2}'.format(params.attacker, params.dmg, params.defender); 
        emit('combat', str );
      },
      Hit : function(params) {
        var str = '{0} hits {1} for {2} damage'.format(params.attacker, params.defender, params.dmg);
        emit('combat', str);
      }
    },
    Character : {
      Equip : function(params) {
        var str = '{0} equips {1}'.format(params.actor, params.item);
        emit('character', str);
      }
    },
    Idle : {
      Random : function(params) {
        var str = '{0} looks at you, considering his chances'.format(params.actor);
        emit('character', str);
      }
    }
};

module.exports = Messages;