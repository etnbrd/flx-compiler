# Fluxions

The [fluxionnal execution model](https://github.com/etnbrd/flx-lib) role is to manage and invoke autonomous execution units.
An execution unit accepts only streams as input and output, that is a continuous and infinite sequence of data contained in messages.
We named this execution unit a fluxion.
That is a function, as in functional programming, only dependent from data streams.
It is composed of a unique name, a processing function, and a persisted memory context.

Messages are composed of the name of the recipient fluxion, a body, and are carried by a messaging system.
While processing a message, the fluxion modifies its context, and sends back messages on its output streams.
The fluxion's execution context is defined as the set of state variables whose the fluxion depends on, between two rounds of execution.

The fluxions make up a chain of processing binded by data streams.
All these chains make up a directed graph, managed by the messaging system.