/** App logic **/

var R = require('ramda');

var toUpperCase = function(x){
  return x.toUpperCase();
};

var exclaim = function(x){
  return x + '!';
};

var shout = R.compose(exclaim, toUpperCase);

var rez = shout("send in the clowns");
console.log("HELLLLOOO");
//=> "SEND IN THE CLOWNS!"
