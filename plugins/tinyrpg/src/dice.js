function _rand(n) { 
  return ~~((Math.random() * n) + 1);
} 

var Dice =  {
     D4 : function() {
       return _rand(4);
     },
     D6 : function() {
       return _rand(6);
     },
     D8 : function() {
       return _rand(8);
     },
     D10 : function() {
       return _rand(10);
     },
     D12 : function() {
       return _rand(12);
     },
     D20 : function() {
       return _rand(20);
     },
     D100 : function() {
       return _rand(100);
     },
     DX : function(x) {
       return _rand(x);
     }
 };
 
 module.exports = Dice;