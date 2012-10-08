var b = {
   extend : function(child, parent){
     child.prototype.__proto__ = parent.prototype;
     child.prototype.__super = parent;
   },
   plugin : function() {}
};

String.prototype.format = function() {
  var formatted = this;
  for (var i = 0; i < arguments.length; i++) {
      var regexp = new RegExp('\\{'+i+'\\}', 'gi');
      formatted = formatted.replace(regexp, arguments[i]);
  }
  return formatted;
};


module.exports = b; 