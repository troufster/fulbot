var Dispatcher = require('../lib/dispatcher');
var Dice = require('./dice');

function emit(type, message) {
  Dispatcher.Emit({ Type: type, Message : message});
}

function randomize(container) {
  return container[Dice.DX(container.length-1)];
}

var data = {
    CombatMiss : ['{0} Misses {1}', '{0} Barely misses {1}', '{0} swings way past {1}'],
    IdleTalk : ['{0} looks around', '{0} whistles happily', '{0} is reading a book', '{0} picks its nose']
};

var Messages = {
    Combat : {
      Miss : function(params){
        var str = randomize(data.CombatMiss).format(params.attacker, params.defender);
        emit('combat', { message : str, attacker : params.attacker, defender : params.defender } );
      },
      Death : function(params) {
        var str = '{0} deal {1} damage, killing {2}'.format(params.attacker, params.dmg, params.defender); 
        emit('combat',  { message : str, attacker : params.attacker, defender : params.defender });
      },
      Hit : function(params) {
        var str = '{0} hit {1} for {2} damage'.format(params.attacker, params.defender, params.dmg);
        emit('combat', { message : str, attacker : params.attacker, defender : params.defender });
      },
	  Crit : function(params) {
        var str = '{0} critically hit {1} for {2} damage'.format(params.attacker, params.defender, params.dmg);
        emit('combat', { message : str, attacker : params.attacker, defender : params.defender });
      }
    },
    Character : {
      Equip : function(params) {
        var str = '{0} equips {1}'.format(params.actor, params.item);
        emit('character', str);
      },
      Levelup : function(params) {
        var str = 'DING {0} is now level {1}'.format(params.actor, params.level);
        emit('character', str);
      }
    },
    Idle : {
      Random : function(params) {
        var str = randomize(data.IdleTalk).format(params.actor);
        emit('character', str);
      }
    }
};

module.exports = Messages;