This compiler transforms a Javascript Express web server, into fluxions.
It breaks the program into multiple independent execution units along rupture points.
Rupture points are characterized by the use of an asynchronous function, or an higher-order function - asynchronous functions are a subset of higher-order functions.

It break a program into multiple parts, then encapsulates them into fluxions.
The result fluxionnal code use the fluxionnal execution model [`flx`](https://github.com/etnbrd/flx-lib).

#Compilation steps

+ [parser](Parser)
+ [pruner](Pruner)
+ [linker](Linker)
+ printer
  + flx-printer
  + js-printer
  + graph-printer

# Definitions

Fluxion
A fluxion is an encapsulated, indepedent unit of execution, with as input and output, only data stream.
<!-- See [paper]() -->

Scope
The scope is a persisted object attached to each fluxion.
This scope is accessed by the fluxion during execution through the keyword this.

Signature
The signature of a fluxion is the set of variable needed by this fluxion.
In practice, we call signature the signature of the current fluxion and of all the upstream fluxions.
