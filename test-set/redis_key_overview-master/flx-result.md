Some interesting patterns in modules/keyoverview.js : 

```
this.express.get('/init', (function(_this) {
  return function(req, res) {
    res.sendfile("./static/html/init.html", function(error) {
      if (error != null) {
        res.send(500, "Fatal Error: Init file is missing!");
      }
    });
  };
})(this));
```

It is probably possible to compile this.
If the compiler understand that this IIEF returns a closure on this, it can create a fluxion around this closure (not around the IIEF).
It should probably be part of the isFunction function (and this function is too big, it should be a module).

---

After compilation : 6 fluxions find (a chain of 3 fluxions \o/)
And I am sure, a shit load of bugs.

Changed every msg._sign into /*msg._sign*/ outside fluxions (so inside the main fluxion)

anonymous-1005 needs _finCreating

anonymous-1004 needs _last, k, _fin, _this

anonymous-1003 needs nothing
It is indeed a log

anonymous-1000 >> anonymous-1001 [exec(signature), _this(signature)]
needs _this, exec

anonymous-1001 >> anonymous-1002 [_this(signature)]
needs _this, exec

anonymous-1002 needs _this

I put the needs into the signature of the calls.
(Don't forget the calls inside the fluxion themselves for anonymous-1000 and 1001)


-------------------------------------------------------------------------------

So, about the isolation of fluxions :

anonymous-1003 aka the error log function is ok to be isolated


all the others depends on _this, and are NOT ok to be isolated.
It seems that _this is an event emitter, and so, when it is serialized, it looses its capacity to emit events, as all the functions are removed.

I will modify the cycle.js to serialize fn in the process, but I doubt it can fix these problems.