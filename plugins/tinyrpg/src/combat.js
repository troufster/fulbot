var Dice = require('./dice'); 
var Messages = require('./messages');

function Combat(attacker, defender) {
      
   //Hit Calc
  //var hit = (attacker.STR + Dice.D12() + attacker.HRoll) - defender.AC;
  var hit = Dice.D20() - defender.AC;
       
   if(hit <= 0) {
     Messages.Combat.Miss({ attacker : attacker.Name , defender :defender.Name})
   } else {
     
     //Dmg calc     
     //var save = Math.floor((defender.Level / 4) + (defender.AC / 2) + 1);
              
     var dmg = Dice.D6();//Dice.D12() + attacker.DRoll - save;
     
     if (dmg <= 0) {
       dmg = 0;
     }
     
     defender.HP -= dmg;          
                      
     //Death
     if(defender.HP <= 0) {
       Messages.Combat.Death({ attacker : attacker.Name, defender : defender.Name, dmg : dmg});
       defender.Death(attacker);
     } else {
       Messages.Combat.Hit({ attacker : attacker.Name, defender : defender.Name, dmg : dmg});
     }
   }
   
   //Make sure target defends itself if he is without target
   if(defender.Target == null) {
     defender.Target = attacker;
   }
   
 }
 
 
 module.exports = Combat;