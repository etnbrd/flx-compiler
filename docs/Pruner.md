#Pruner

The pruner is the second compilation steps.
From the AST given by the parser, the pruner generates the functional scopes description with [escope](https://github.com/Constellation/escope), and the fluxional scopes description.
Using the AST, the pruner detect asynchronous call as rupture points indicating the separation between two fluxions.
It outputs a context describing the network of fluxion in the submitted AST.

This context represent the mapping between the fluxion scopes in the original program, and the fluxions.

In Javascript, function scope are nested the same way as the declaration of functions.
The child scope can acess properties of the parent.

Fluxions scopes aren't nested the same way.
A fluxion is linked with another by a rupture point : an asynchronous call.
This rupture point indicate a link between two fluxions.

The pruner map the function scopes to the corresponding fluxion scope, and link fluxion together.

However, the pruner doesn't resolve conflict of dependency between fluxion scope and function scope, the linker does.