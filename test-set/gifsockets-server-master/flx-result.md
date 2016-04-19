One fluxion detected on fs.readFileSync, it's synchronous, so it's bad.

There is one due detected, but the flx-compiler can't find it.
I am looking for the reason why it isn't detected.
(It has something to do with triggers and so on).

There is actually many start rupture points detected (~6) but as the callback is unknown (identifiers, or object properties most of the time) it cannot be split.

---

I fixed the compiler so that it detects the due.
The problem was with the isFunction function used by the triggers in the analyzer.
To also detect the start rupture points, the isFunction should be improved a lot.
It is currently a mess.

When I run app-FLX.js I get an error because req is not defined.
Indeed, req is defined as scope by the compiler because there is a function call (which can modify the object), so it is required during the definition of the fluxion.
But req doesn't exists at this time.
I commented the two lines : req and next

When I run app.js or app-FLX.js, the result is the same : it quit almost immediately.

I am going to inspect that.
-> Dumb me, I ran the library, not the binary.

Now with the binary, I get an error.
-> because routes/index.js uses exports to define some routes (// Expose openImage, writeJsonToImages, writeTextToImages, and closeOpenImages)

The bug comes from my laziness to implement a correct module loading replacement.
I added two lines to define exports.

```
var exports = {};
var module = {exports: exports};
```

---

The server launches, but crash when I request the page.
Because of the bug with req and next, their references are blindly modified through the scope, which causes them to be undefined.

I commented the definition like this, for every occurence
```
/*msg._sign.*/req.gifsocket = gifsocket;
/*msg._sign.*/next();
```

---

getRawBody is not defined.
-> I moved the definition to the scope of the fluxion, and changed the call to this.getRawBody

At the end of the development of the compiler, we made important change precipitately : the code modification for start is as expected, a placeholder for callback to send the message to the next fluxion.
But the code modification for post embed the whole asynchronous call into the next fluxion.
This changes followed an observation that later proved to be false :
All post operations have a huge IO between the async call and the callback -> think of fs.read.
While for start operations, it is not the case, and it is preferable to leave the async call where it is.
So, I should modify the way post operations are modified.

I added req, res and next to the signature, to make them available downstream.
And I modified their references like this :
```
msg._sign.req.body = buffer;
msg._sign.next();
```

The triggers : 
```
this.startTriggers = ['getRawBody', 'app'];
this.postTriggers = [];
```

With all these modifications, it works perfectly.
The test passes, and the server works as expected.

TODOS
- modify the module loader
- modify the code modification for post

TO AUTOMATE IT COMPLETLY
- modify the module loader to detect relative paths, and change them automatically.
- fix the scope / signatures bugs.



-------------------------------------------------------------------------------

I tried to isolate the only fluxion, and execute it on a remote worker.
FAIL.

The fluxion uses the function next, which is a closure, part of express.
I don't know how to change that.
Maybe by modifying express, I could send a mocked-up next function which sends a message to execute the real next function on the master.
The problem is, the fluxion modifies req, by adding the message to send back to the client (as far as I understant), but the function next doesn't have any arguments.
It relies here on side-effects to complete the requet.
So, I believe that by modifying express to NOT rely on side-effects, (adding the req / res arguments to next, it should be able to work).

However, this fail is a part succes, because I know now that res and req can be serialized.
(Yes, they loose all functions and closures, but yet, it is possible)

My question now, is : it is possible to write an equivalence of express, without these side effects, yet still being as simple to use as express ?
At which point in the absence of side-effect, express becomes a storm ?

-------------------------------------------------------------------------------

I finally wrote fluxionnal modification for express, and it works, with an isolated fluxion.

However, this example is completly point-less, because the isolated fluxion only gather the body, and assign it in the req.

I had to modify one line of the application :
Instead of calling next(), the function in the fluxion return a message to be sent to the express-dispatcher, which continues the execution with the next callback.

The main problem here, is that it is impossible to send closure to the network.
So, either it is only possible to isolate stateless fluxions (or almost stateless).
Or the memory analysis needs to be deeper, and take closures into account.
(serialize / deserialize closures)

I need to understand and explain EXACTLY what is the deal with closures.
At the end of the linker section, I barely mention them, I should explain what the deal is in more details :
What does it mean to have a splitted application ?
What does it mean to not be able to use closures ?
Is Javascript useless without closures ?