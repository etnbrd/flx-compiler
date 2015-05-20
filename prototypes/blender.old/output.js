var flx = require("./../fluxions/lib/flx");

flx.register("3$5+1013$9$1+1013", function(msg) {
  var L3 = 3;
  var L5_1013 = 5;
  var L9 = 9;
  var L1_1013 = 1;
  msg["-_29214-1003+1009+1013"] = L3 - L5_1013;
  msg["-_29214-1003+1010+1013"] = L9 - L1_1013;
  return flx.m(["-_29214-1003+1009+1013$-_29214-1003+1010+1013"], msg)
});

flx.register("-_29214-1003+1009+1013$-_29214-1003+1010+1013", function(msg) {
  msg["+_59530-1008+1013"] = msg["-_29214-1003+1009+1013"] + msg["-_29214-1003+1010+1013"];
  return flx.m(["+_59530-1008+1013"], msg)
});

flx.register("+_59530-1008+1013", function(msg) {
  return flx.m(["d_74717-1012"], msg)
});

flx.register("d_74717-1012", function(msg) {
  console.log(msg)
  return undefined;
});

flx.start(flx.m("3$5+1013$9$1+1013", {}))