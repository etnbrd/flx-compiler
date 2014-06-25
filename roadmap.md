# Problem #1

Transform the simplest program into fluxions.

The simplest program is in `src/count1.js`.

```
var app = require('express')();

app.get("/", function reply(req, res){
  res.send("42");
});

app.listen(8080);
console.log(">> listening 8080");
```

It's a server which reply to every request with a fixed value.

Rupture points are characterized by the use of an asynchronous function.

Ouput fluxions should be...


The compiled result is in `results`:



(TODO Asynchronous function, or Higher-order functions ?)

Asynchronous functions are a subset of Higher-order functions.
Based on a list of asynchronous function, the compiler break the program into multiple fluxions along the rupture points.

# Problem #2


# Problem #3


# Problem #4

