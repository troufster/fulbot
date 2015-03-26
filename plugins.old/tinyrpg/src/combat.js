var Dice = require('./dice'); 
var Messages = require('./messages');

function Combat(attacker, defender) {

   //Hit Calc
  //var hit = (attacker.DEX + (Dice.D12() + 2) + attacker.HRoll) - (defender.AC * 0.6);
  var hit = (Dice.D20() + attacker.DEX + attacker.HRoll) - (defender.AC * 0.6);

  //console.log("HITCALC",hit, attacker.AI.curState, defender.AI.curState);

   if(hit <= 0) {

     Messages.Combat.Miss({ attacker : attacker.Name , defender :defender.Name})
   } else {
     
     //Dmg calc     
     var save = Math.floor((defender.Level / 4) + (defender.AC / 4));
              
     //var dmg = Dice.D6();//
     var dmg = Math.floor(Dice.D6() + (attacker.STR * 0.5) + attacker.DRoll - save);
     
	 //10 dex = 1% crit, 5% base
	 var crit = Dice.DX(100) - 5 < (attacker.DEX/10) ;
	 
	 if (crit) {
		dmg = dmg *  2;
	 }
	 
     if (dmg <= 0) {
       dmg = 0;
     }
     
	 
	 
	 
     defender.HP -= dmg;          
                      
     //Death
     if(defender.HP <= 0) {
       Messages.Combat.Death({ attacker : attacker.Name, defender : defender.Name, dmg : dmg});
       defender.Death(attacker);
     } else {
		if(crit) {
		Messages.Combat.Crit({ attacker : attacker.Name, defender : defender.Name, dmg : dmg});
		} 
		else {
		Messages.Combat.Hit({ attacker : attacker.Name, defender : defender.Name, dmg : dmg});
	   }
     }
   }
   
   //Make sure target defends itself if he is without target
   if(!defender.Target) {
     defender.Target = attacker;
     defender.AI.setState('Attack');
   }
   
 }
 
 
 module.exports = Combat;