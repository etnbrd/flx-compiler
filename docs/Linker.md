#Linker

Fluxions are indenpendent execution unit, so they can't easily access memory outside their scope.

A fluxion span over multiple function scopes.
As these scopes are broken from their original position in the code, they can't access parent scope anymore.

Breaking a program into fluxion leaves dependencies unresolved between these separated function scopes.
An unresolved dependency is a variable used in at least two scopes dependeing on different fluxions.

The linker is the third compilation steps, it makes the fluxion resolve these dependencies by sending messages.

There is different kind of dependencies to resovle , see [core.js:detectDependency](https://github.com/etnbrd/flx-compiler/blob/master/lib/linker/core.js), and different way to resolve them.

Dependencies :

+ *n* fluxions, none modify the variable : scope.
+ 2 fluxions, the root fluxion doesn't modify the variable : scope.
+ more than 2 fluxions, the non root fluxion doesn't modify the va riable : sync.

Solution :

+ **scope**
  The variable is put in the scope of the fluxion during the fluxion registration.
  The variable will be persisted for the lifetime of the program, and the fluxion will be able to access and modify it.

+ **signature**
  The variable value is sent by message from one fluxion to another.

+ **sync**
  A mix between scope and signature.
  When two, or more, fluxions modify a same variable, this variable needs to be synchronised between all of these fluxions.
  A copy of the variable is declared in each fluxion scope.
  And at each modification, the fluxion send the update to every other fluxion depending on this variable.

  The update of a variable is simple for the moment, but for real life applicaiton, an update will need an aggregator function, and a journaled version of the variable.