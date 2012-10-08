var Base = require('../lib/base');
var Combat = require('./combat');
var Messages = require('./messages');
var Vector = require('../lib/vector');
var sys = require('sys');


function GameObject(params) {
  this.pos = params.pos;
  this.id = params.id;
}

function Entity(params) {  
  GameObject.call(this,params);
  
  this.Room = null;
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
  this.Race = params.race;
  this.AI = null;
  this.Client = params.Client;
  
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
}

Character.prototype.Update = function() {  
  this.AC = this.MaxAC();
  this.DRoll = this.StatMod('DRoll');
  this.HRoll = this.StatMod('HRoll');    
}


Character.prototype.MaxAC = function() {  
  return ~~(10 + this.StatMod('AC'));  
}

Character.prototype.MaxHP = function() {
  //return Math.floor((12 + ((this.STR + this.StatMod('STR')) * 1) + (this.Level * 1)));
  var base = (6 + this.Level);
  return ~~((base * base)/10);
}

Character.prototype.StatMod = function(stat) {        
  val = 0;
  var eq = this.Equipment;

  //Account for eq mods
  for(var e in eq) {
   if(eq[e]) {
    val += eq[e][stat];
   }
  }   
    
  return val;
}

Character.prototype.Equip = function(item) {
  this.Equipment[item.Type] = item;
  Messages.Character.Equip({ actor : this.Name, item : item.Name});
  
  this.Update();  
}

Character.prototype.SetTarget = function(target) {
  if(!this.Target) {
    this.Target = target;
  }
}

Character.prototype.Attack = function(target) {    
    
    this.SetTarget(target);
    
    this.AI.setState('Attack');
    
    this.Target.Defend(this);
}

Character.prototype.Hit = function() {
  var target = this.Target; 
  
  if(target.HP > 0) {
    Combat(this, target);
  } else {
    this.AI.setState('Idle');
  }
  
}

Character.prototype.Defend = function(target) {
  this.SetTarget(target);
  this.AI.setState('Attack');
}

Character.prototype.Death = function(killer) {
  killer.Target = null;  
  this.AI.setState('Dead');
}


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
}

Character.Player = function(client, cid) {
  //Todo : fetch character by character id
  var c = new Character({ STR: 10, DEX: 1, MIND: 1, Name : 'Player', Client : client, pos : new Vector(0,0), id : client.id });
  
  c.Reset();
  
  return c;
}




//Base.extend(Character, Entity);



function Item(params){
  Entity.call(this, params);
  this.Type = params.Type;   
}

//Base.extend(Item, Entity);
sys.inherits(Item, Entity);


exports.Entity = Entity;
exports.Character = Character;
exports.Item = Item;
