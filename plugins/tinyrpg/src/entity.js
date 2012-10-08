var Base = require('../lib/base');
var Combat = require('./combat');
var Messages = require('./messages');
var Vector = require('../lib/vector');
var sys = require('util');
var Dispatcher = require('../lib/dispatcher');
var Dice = require('./dice');
var Generators = require('./generators');


function GameObject(params) {
  this.pos = params.pos;
  this.id = params.id;
}

function Entity(params) {  
  GameObject.call(this,params);
  
  //this.Room = null;
  this.Name = params.Name;
  this.STR = params.STR || 0;
  this.DEX = params.DEX || 0;
  this.MIND = params.MIND || 0;
  this.AC = params.AC || 0;
  this.Level = 1;    
  this.HRoll = params.HRoll || 0;
  this.DRoll = params.DRoll || 0;  
}


sys.inherits(Entity, GameObject);

function Character(params) {  
  Entity.call(this, params);


  this.Target = null;
  //this.Race = params.race;
  this.AI = null;
  this.Client = params.Client;
  this.Exp = 0;
  this.Inventory = [];

  
  this.Equipment = {
      'Head' : null,
      'Armor' : null,
      'Weapon' : null,
      'Shield' : null
  }
  
  this.Reset();  
}

sys.inherits(Character, Entity);

Character.prototype.Reset = function() {
  this.HP = this.MaxHP();
  
  this.Update();
};

Character.prototype.Update = function() {  
  this.AC = this.MaxAC();
  this.DRoll = this.StatMod('DRoll');
  this.HRoll = this.StatMod('HRoll');    
};


Character.prototype.MaxAC = function() {  
  return ~~(10 + this.StatMod('AC'));  
};

Character.prototype.MaxHP = function() {
  //return Math.floor((12 + ((this.STR + this.StatMod('STR')) * 1) + (this.Level * 1)));
  var base = (8 + this.Level);
  return ~~((base * base)/10);
};

Character.prototype.StatMod = function(stat) {        
  var val = 0;
  var eq = this.Equipment;

  //Account for eq mods
  for(var e in eq) {
   if(eq[e]) {
    val += eq[e][stat];
   }
  }   
    
  return val;
};

Character.prototype.Equip = function(item) {
  this.Equipment[item.Type] = item;
  Messages.Character.Equip({ actor : this.Name, item : item.Name});
  
  this.Update();  
};

Character.prototype.SetTarget = function(target) {
  if(!this.Target) {
    this.Target = target;
  }
};

Character.prototype.Attack = function(target) {    
    
    this.SetTarget(target);
    
    this.AI.setState('Attack');
    
    target.Defend(this);
};

Character.prototype.Hit = function() {
  var target = this.Target; 
  
  if(target.HP > 0) {
    Combat(this, target);
  } else {
    this.AI.setState('Idle');
  }
  
};

Character.prototype.Defend = function(target) {
  this.SetTarget(target);
  this.AI.setState('Attack');
};

Character.prototype.NextLevel = function() {
  return  (this.Level * 10) * this.Level;
};

Character.prototype.checkLevel = function() {
  var nextlevel = this.NextLevel();

  console.log(nextlevel, this.Exp);

  if(this.Exp > nextlevel) {
    this.Level += 1;
    this.Reset();

    Messages.Character.Levelup({ actor : this.Name , level : this.Level});
  }


};

Character.prototype.addInventory = function(item) {
  Dispatcher.Emit({ Type: 'item', Message : { player : this.Name, item: item }});
  this.Inventory.push(item);
};

Character.prototype.Death = function(killer) {
  killer.Target = null;  
  this.AI.setState('Dead');
  killer.AI.setState('Idle');

  Dispatcher.Emit({ Type: 'death', Message : this.Name});

  var exp = this.Level + (Dice.D4() * 2);


  var lootroll = Dice.DX(10);
  
  if(lootroll < 50){
    var drop =  new Generators.WeaponGenerator().generate(this.Level, 10);

    console.log("Lootroll", lootroll, drop);
    killer.addInventory(drop);
  }


  killer.Exp += exp;
  killer.checkLevel();
};

Character.prototype.Readable = function() {

  var template = "[\x0314,1{0}\x03 Lvl:\x0314,1 {4} ({6}/{7}) \x03 HP: {8}/{9} ({1} STR, {2} DEX, {3} MIND) State: {5} ]";

  return template.format(this.Name, this.STR, this.DEX, this.MIND, this.Level, this.AI.curState, this.Exp, this.NextLevel(), this.HP, this.MaxHP());
};

Character.prototype.Json = function() {    
  var char = { Equipment : {}};
  var nosend = [];//['AC', 'AI', 'DEX', 'MIND', 'DRoll', 'HRoll', 'STR'];
  
  for(var prop in this) {
    var type = typeof this[prop];
    
    if(nosend.indexOf(prop) > -1) continue;
    
    if(type === 'function') continue;
    
    if(type === 'object') {
      if(prop == 'Client') continue;
      
      if(prop == 'Target') {
        char[prop] = this[prop] == null ? null : this[prop].Json();
      }
    } 
      
      char[prop] = this[prop];   
    
  }
        return char;
};

Character.Player = function(client, cid) {
  //Todo : fetch character by character id
  var c = new Character({ STR: 10, DEX: 1, MIND: 1, Name : 'Player', Client : client, pos : new Vector(0,0), id : client.id });
  
  c.Reset();
  
  return c;
};


function Item(params){
  Entity.call(this, params);
  this.Type = params.Type;   
}

sys.inherits(Item, Entity);

exports.Entity = Entity;
exports.Character = Character;
exports.Item = Item;
