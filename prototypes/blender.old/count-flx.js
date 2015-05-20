var flx = require("./lib/flx"), web = require("./lib/web");

flx.register("/:id", function fn(msg) {
    return flx.m("output", this.count = this.count + 1);
}, {
    count: 0
});

web.route("/:id", "/:id", "/:id");