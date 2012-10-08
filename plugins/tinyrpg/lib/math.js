
var Vector = require('./vector'),
    Base   = require('./base');
  
/*
 * A cubic extrapolator using the polynomial
 *  P(T) = aT^2 + bT + c
 */
function Extrapolator() {
  this.s = [];
  this.t = [];
  this.sol = [];
};

/*
 * Add a sample to the extrapolator
 * @param {Number} s Sample
 * @param {Number} t Time 
 */
Extrapolator.prototype.addSample = function(s, t) {
  this.s.push(s);
  this.t.push(t);
  
  //We only handle 3 samples, so shift if we get more
  if(this.s.length > 3) {
    this.s.shift();
    this.t.shift();
  }
  
  //Only compute solution if we have 3 samples
  if(this.s.length > 2) {
    this.sol = Extrapolator._solve(this.s,this.t);
  }
};

/*
 * Return a predicted value from the extrapolator.
 * @param {Number} t Time to predict value for.
 * @Return {Number} P(T) of polynomial.
 */
Extrapolator.prototype.getValue = function(t) {  
  var s = this.sol;
  return s[0] * t * t + s[1] * t + s[2];
};

/*
 * Solves a 3x3 simultaneous equation system 
 * using cramers rule.
 */
Extrapolator._solve = function(p, t) {
 
 //cramers rule.
 var t0 = t[0], t1 = t[1], t2 = t[2],
     p0 = p[0], p1 = p[1], p2 = p[2],
     
     //Set up system
     a  = t0 * t0, b = t0, c = 1, d = p0,
     e  = t1 * t1, f = t1, g = 1, h = p1,
     i  = t2 * t2, j = t2, k = 1, l = p2,
     
     //Delta determinant
     delta = (a * f * k) + (b * g * i) +
             (c * e * j) - (c * f * i) -
             (a * g * j) - (b * e * k),
     
     //x answer(a);
     xnum  = (d * f * k) + (b * g * l) +
             (c * h * j) - (c * f * l) -
             (d * g * j) - (b * h * k),
     xans = xnum/delta,
     
     //y answer(b)
     ynum  = (a * h * k) + (d * g * i) +
             (c * e * l) - (c * h * i) -
             (a * g * l) - (d * e * k),
     yans = ynum/delta,
     
     //z answer(c)
     znum  = (a * f * l) + (b * h * i) +
             (d * e * j) - (d * f * i) -
             (a * h * j) - (b * e * l),
     zans = znum/delta;
     
     return [xans, yans, zans];
};

/*
 * A 2D Vector extrapolator using
 * one extrapolator for each component
 */
function Vector2Extrapolator() {
  this.ex = new Extrapolator();
  this.ey = new Extrapolator();
};

/*
 * Add a sample to the extrapolator
 * @param {Number} s Sample
 * @param {Number} t Time 
 */
Vector2Extrapolator.prototype.addSample = function(v,t) {
  this.ex.addSample(v.x, t);
  this.ey.addSample(v.y, t);
};

/*
 * Return a predicted value from the extrapolator.
 * @param {Number} t Time to predict value for.
 * @Return {Number} P(T) of polynomial.
 */
Vector2Extrapolator.prototype.getValue = function(t) {
  var x = this.ex.getValue(t);
  var y = this.ey.getValue(t);
  return new Vector(x,y);
};


/*
 * A Generic interpolator
 * @param {Interpolator.Type} type The type of interpolator to load.
 * @param {Number} max The maximum amount of samples to store ahead.
 * @param {Number} buffer The amount of samples to buffer before
 *                 returning interpolated values.
 */
function Interpolator(type, max, buffer) {
  this._i = type.func;          //Interpolator function
  this._snum = type.samples;    //Number of samples needed by interpolator
  this.s = [];                  //Samples array
  this.t = [];                  //Time samples
  this.max = max;               //Max amount of samples to store ahead
  this.shift = false;           //Tell the client to shift samples
  this.lastVal = null;          //Last returned value
  this.buffer = buffer;         //Number of samples to buffer before returning vals
 };

Interpolator.prototype.getOverflow = function() {
  return this.s.length - this.max;
}

/*
 * Adds a sample to the interpolator
 * @param {Object} sample Sample of whatever type used by interpolator function
 * @param {Number} time Timestamp of sample (to be used when extrapolating unknown values)
 */
Interpolator.prototype.addSample = function(sample, time){
  var p = this.s,
      t = this.t;
  p.push(sample);
  t.push(time);

  //If we reached max number of samples, we should tell the client to shift
  //at next opportunity
  if(p.length > this.max) {
   this.shift = true;
  }
};

Interpolator.prototype.setSample = function(sample, time, n){
  this.s[n-1] = sample;
  this.t[n-1] = time;
};
/*
 * Shifts samples and time arrays. This is used when a client has reached the end of a 
 * segment and needs to start interpolating the next segment. Shifts are called by the 
 * client and should only ever happen when T > 1 (0 < T < 1)
 */
Interpolator.prototype.shiftSamples = function() {
    this.shift = false;
    this.s.shift();
    this.t.shift();
};


/*
 * Gets the interpolated value for the current segment at factor t
 * @param {Number} t Factor of interpolation
 * @param {Function} _cb(value, shift) Callback function 
 * 
 * When shift is returning true, the client is responsible for calling
 * shiftSamples.
 */
Interpolator.prototype.getValue = function(t, _cb) {
  var s = this.s,
      sl = s.length,
      snum = this._snum,
      lv = this.lastVal,
      _s = s.slice(0);
  
  //Number of samples is lower than buffer, return last value
  if(sl < this.buffer) return _cb(lv,false);
  
  //If missing a sample, extrapolate one from previos 3
  //Todo: make sure extrapolation is linear if only two samples present..
  //Todo: return lv if sl == 1
  if (sl < this._snum) {
    if (sl < 3) return _cb(lv,false);
    
    var ex = new Vector2Extrapolator();
    ex.addSample(_s[0],1);
    ex.addSample(_s[1],2);
    ex.addSample(_s[2],3);
    _s[3] = ex.getValue(4);
  } 
  
  

  //Callback with interpolating function and current shift value
  _cb(this.lastVal = this._i(_s,t), this.shift);
};

/*
 * A 2d Vector Linear interpolator using 2 samples
 */
Interpolator.Linear = {
  samples : 2,
  func : function(d,t){    
    var v1 = d[0],
        v2 = d[1];
          
    if(!v1 || !v2) return this.lastVal;         
      
    var r1x = v1.x * (1-t),
        r1y = v1.y * (1-t),
        r2x = v2.x * t,
        r2y = v2.y * t;               
      
    return(new Vector(r1x+r2x,r1y+r2y));
  }
};

/*
 * 2d Vector Catmull Rom spline interpolator 
 */
Interpolator.CatmullRom = {
  samples : 4,
  func : function(d,mu) {
      
    var v0 = d[0],
        v1 = d[1],
        v2 = d[2],
        v3 = d[3],
        a0,a1,a2,a3,mu2;
  
    if(!v0 || !v1 || !v2 || !v3 || mu === undefined) return this.lastVal;
        
    
    mu2 = mu*mu;
    
    var a0x = -0.5 * v0.x + 1.5 * v1.x - 1.5 * v2.x + 0.5 * v3.x,
        a0y = -0.5 * v0.y + 1.5 * v1.y - 1.5 * v2.y + 0.5 * v3.y,
        a1x = v0.x - 2.5 * v1.x + 2 * v2.x - 0.5 * v3.x,
        a1y = v0.y - 2.5 * v1.y + 2 * v2.y - 0.5 * v3.y,
        a2x = -0.5 * v0.x + 0.5 * v2.x,
        a2y = -0.5 * v0.y + 0.5 * v2.y,
        a3x = v1.x,
        a3y = v1.y,
        
        rx = a0x * mu * mu2 + a1x * mu2 + a2x * mu + a3x,
        ry = a0y * mu * mu2 + a1y * mu2 + a2y * mu + a3y;
        
    return new Vector(rx,ry);
    }
  };

/*
 * 2d Vector Hermite interpolator
 */
Interpolator.Hermite = {
  samples : 4,
  func : function(d,mu) {
    var v0 = d[0],
        v1 = d[1],
        v2 = d[2],
        v3 = d[3],
        bias = 0,
        tension = -0.3;
    
    if(!v0 || !v1 || !v2 || !v3 ||  mu === undefined) return this.lastVal;    
    
    var mu2 = mu * mu,
        mu3 = mu2 *mu,
        bbias = (1+bias),
        cbias = (1-bias),
        ten   = (1-tension),
        pb = bbias * ten / 2,
        nb = cbias * ten / 2;        
        
    var m0x = (v1.x-v0.x) * pb,
        m0y = (v1.y-v0.y) * pb;
        
    m0x += (v2.x-v1.x) * nb;
    m0y += (v2.y-v1.y) * nb;
    
    var m1x = (v2.x-v1.x) * pb,
        m1y = (v2.y-v1.y) * pb;
    
    m1x += (v3.x-v2.x) * nb;
    m1y += (v3.y-v2.y) * nb;
    
    var a0 =  2*mu3 - 3*mu2 + 1,
        a1 =    mu3 - 2*mu2 + mu,
        a2 =    mu3 -   mu2,
        a3 = -2*mu3 + 3*mu2,
    
        rx = a0*v1.x + a1*m0x + a2*m1x + a3*v2.x,
        ry = a0*v1.y + a1*m0y + a2*m1y + a3*v2.y;
    
    return new Vector(rx,ry);
  }
};

/*
 * 2d Vector Cubic interpolator
 */
Interpolator.Cubic = {
  samples : 4,
  func : function(d,mu) {
    var v0 = d[0],
        v1 = d[1],
        v2 = d[2],
        v3 = d[3],
        a0,a1,a2,a3,mu2;
    
    if(!v0 || !v1 || !v2 || !v3 ||  mu === undefined) return this.lastVal;    
    
    mu2 = mu*mu;
    
    var a0x = v3.x - v2.x - v0.x + v1.x,
        a0y = v3.y - v2.y - v0.y + v1.y,
        a1x = v0.x - v1.x - a0x,
        a1y = v0.y - v1.y - a0y,
        a2x = v2.x - v0.x,
        a2y = v2.y - v0.y,
        a3x = v1.x,
        a3y = v1.y,
        rx = a0x * mu * mu2 + a1x * mu2 + a2x * mu + a3x,
        ry = a0y * mu * mu2 + a1y * mu2 + a2y * mu + a3y;
        
    return new Vector(rx,ry);
            
  }
};

exports.Extrapolator = Vector2Extrapolator;
