(function(){

/**
 * A simple but functional FSM
 *
 * @param {States} s Object describing states/transitions
 * @param {State} is Initial state of FSM
 * @constructor
 */
function FSM(s,is) {
  this.states = s;
  this.iState = is;
  this.curState = is;
};

/**
 * Sets the state of this FSM instance
 * @param {State} state State to set
 */
FSM.prototype.setState = function(state) {
  this.curState = state;
};

/**
 * Runs current state
 * @param {Entity} agent Parent of FSM instance
 * @return {val} result of state
 */
FSM.prototype.runCurrent = function(agent) {
  return this.states[this.curState][0](agent);
};

  
/**
 * Updates FSM by checking all possible transitions
 * from current state, and switchig state on the first
 * function to return true
 *
 * @param {Entity} agent Parent of FSM instance
 */ 
FSM.prototype.update = function(agent) {
  //Evaluate current states transitions
  var cs = this.curState,
      s = this.states,
      
      //Transitions are all funcs with index 3 and up
      trans = s[cs].slice(3),
      tl = trans.length,

      //new state
      ns = null;

  //Iterate transitions
  while(tl--) {
    if(trans[tl][0](agent)) {  //If transition function is true
      ns = trans[tl][1];       //New state
      s[cs][2](agent);  //Run current state exit func
      s[ns][1](agent);  //Run new state entry func
      this.curState = ns;
      break;
    }
  }
};

  module.exports = FSM;

})();
 