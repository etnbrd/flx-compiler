Some of the packages are only libraries.
(I am going to build the servers to test them, but later)
moonridge
express-couchuser
heroku-bouncer
slack-integrator
tingo-rest
timbits
express-endpoint

For the package that contains binary :
gifsocket-server -> OK, 1 flx
but seems difficult to distribute, because the signature of the stream contains req, res, next, we need something like sharedArrayBuffers, maybe

redis-key-overview -> OK 6 flx : 3 in one continus stream, and 1 pure (a log)
Again, in the signature we find things like : _this, probably to represent the current state of the request.
If it represent the state of the current request (and not the state of the program) then it is safe to distribute it, but difficult, because it is probably a big object, and it might contain local references (sockets and so on)

The conclusion is that we can compile real-world example Javascript into fluxions.
However, these fluxions are *_NOT_* independent.
They don't share scope, but they still share the heap memory.

To continue, we need to implement a new fluxional model, using multiple node instances (at last !!!!)

I have two ideas here :
- Use cluster to share the same http server (it might resolve the problem of local references, but still with multi-cores), and creates one endpoints per fluxion. It has the advantage to be simple to create fluxions (but I don't really want to share public endpoints with fluxion endpoints).

- Use multiple instances of nodes.