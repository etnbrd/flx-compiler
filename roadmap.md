This compiler aims at transforming a server using the framework Express, into a code compatible with the fluxionnal execution model `flx`.
It break a program into multiple parts, then encapsulates them into fluxions.

Rupture points are characterized by the use of an asynchronous function.
(TODO Asynchronous function, or Higher-order functions ?)

Asynchronous functions are a subset of Higher-order functions.
Based on a list of asynchronous function, the compiler break the program into multiple fluxions along the rupture points.

# Definitions

Fluxion
A fluxion is an encapsulated, indepedent unit of execution, with as input and output, only data stream.
See [paper]()

Scope
The scope is a persisted object attached to each fluxion.
This scope is accessed by the fluxion during execution through the keyword this.

Signature
The signature of a fluxion is the set of variable needed by this fluxion.
In practice, we call signature the signature of the current fluxion and of all the upstream fluxions.


# Problem #1

The server of problem #1 reply a constant value to every request.
There isn't any variable used.


The simplest program is in `examples/count1.js`.

```
var app = require('express')();

app.get("/", function reply(req, res){
  res.send("42");
});

app.listen(8080);
console.log(">> listening 8080");
```

The compiled result is in `results/count1.js`:

```
  var flx = require("flx");
  var app = require('express')();
  
  app.get("/", function placeholder() {
    return flx.start(flx.m("reply", {
      _args: arguments,
      _sign: {}
    }));
  });
  
  app.listen(8080);
  console.log(">> listening 8080");

// reply >> ø

  flx.register("reply", function capsule(msg) {
      (function reply(req, res) {
        res.send("42");
      }).apply(this, msg._args);
  });
```

Output fluxion should be ...


# Problem #2

The server of problem #2 reply a constant value to every request, using a variable declared inside the reply function.
This variable shouldn't be exchanged between fluxions, as it's declared and used in the same function.


```
var app = require('express')();

app.get("/", function reply(req, res){
  var reply = 42;
  res.send(reply);
});

app.listen(8080);
console.log(">> listening 8080");
```

The compiled result is in `results/count2.js`



# Problem #3

Same with a variable declared outside, and used inside a fluxion.
This variable should be in the signature of this fluxion.


# Problem #4

Same with a variable initialised outside, and modified inside a fluxion.
This variable should be part of the scope of this fluxion.

# Problem #5

Same with a variable declared outside, modified outside and inside a fluxion.
This variable shouldn't be part of the scope of this fluxion, and should be updated by the fluxion.


# Problem #6

Same with objects.


# Problem #7

Same with arrays.