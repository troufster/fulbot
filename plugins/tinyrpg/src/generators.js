var FSM = require('../lib/fsm');
var AI = require('./ai');
var Dice = require('./dice');


function MonsterGenerator() {
  this.Character =require('./entity').Character;
  this.pre = ['Gr', 'Kr', 'Gu', 'Ar', 'Ug', 'Bu', 'Co', 'Lo', 'Af', 'Robin', 'Ulla'];
  this.mid = ['og', 'ib', 'is', 'id', 'ad', 'ed', 'ro', 'fn', 'sxe'];
  this.end = ['oth', 'ork', 'ith', 'eth', 'ath', 'ir', 'id', 'ed', 'eng', 'sson', 'zor', 'zorzor'];
}

MonsterGenerator.prototype.generate = function(num, level) {
  var ret=[];

  for(var i = 0, l = num; i < l; i++) {

    var name = this.pre[Dice.DX(this.pre.length)-1] +
            this.mid[Dice.DX(this.mid.length)-1] +
          this.end[Dice.DX(this.end.length)-1];


    var monster = new this.Character({ STR: (level *2) + Dice.D4(), DEX: (level *2) + Dice.D4(), MIND: (level *2) + Dice.D4(), Name : name});
    monster.AI = new FSM(AI.Generic, 'Idle');
    ret.push(monster);

  }



  return ret;
};


exports.MonsterGenerator = MonsterGenerator;


function WeaponGenerator() {
  this.Item = require('./entity').Item;
  this.prefix = ['Broken', 'Worn', 'Regular', 'Good', 'Fine', 'Better', 'Pristine', 'Extraordinary', 'Epix', 'Legendary'];
  this.type = ['spoon', 'knife', 'shiv', 'fork', 'toothpick', 'sword', 'shotgun', 'hammer', 'dildo', 'narwhal horn'];
  this.affix = ['eating', 'cowards', 'heroes', 'wrath', 'agony', 'sogeti', 'hax', 'nerfzor'];

}

WeaponGenerator.prototype.generate = function(lvl, cap) {
  var prefixWeight = Dice.DX(this.prefix.length)-1;
  if(prefixWeight > cap) prefixWeight = cap;

  var prefix = this.prefix[prefixWeight];
  var type = this.type[Dice.DX(this.type.length)-1];
  var affixWeight = Dice.DX(this.affix.length)-1;
  var affix = this.affix[affixWeight];

  var name = '{0} {1} of {2}'.format(prefix, type, affix);

  var modweight = Math.floor((prefixWeight+affixWeight) * 0.7);
  var numstats = Math.floor(modweight/3)+1;

  if(numstats > 6) numstats = 6;

  //DRoll HRoll STR DEX MIND AC
  var stats = ['DRoll', 'HRoll', 'STR', 'DEX', 'MIND', 'AC'];

  var pickedstats = [];

  function pick() {
    return Dice.DX(stats.length);
  }

  function len() {
    return pickedstats.length;
  }

  while(len() < numstats) {
    var p = pick();
    if(pickedstats.indexOf(p) < 0) {
      pickedstats.push(p);
      console.log(pickedstats, p, len(), numstats-1);
    }
  }

  //Assign stats.
  var item = new this.Item({ Name : name, Type : 'Weapon' });

  for(var i = 0; i < pickedstats.length; i++) {
    item[stats[pickedstats[i]]] = Math.floor((modweight/2) + Dice.DX(2) * lvl * 0.5)+prefixWeight;
  }
  return item;
};


exports.WeaponGenerator = WeaponGenerator;



