assert = require 'assert'
globals = require '../globals'
flx = require '../flx'
esprima = require 'esprima'
escope = require 'escope'

mock = (scope) ->
    assert (globals scope) instanceof Array, 'Not an array'
    'ok'

describe 'flx', ->
    describe 'no flx.register', ->
        it 'app.get should return an 0-length array', ->
            assert.equal 0, flx('   app.get("/B", function placeholder() {
                                      return flx.start(flx.m("replyB", {
                                        _args: arguments,
                                        _sign: {}
                                      }));
                                    });', mock).length

        it 'app.register should return an 0-length array', ->
            assert.equal 0, flx('   app.register("replyA", function capsule(msg) {
                                        (function replyA(req, res) {
                                          res.send("" + _rep);
                                          this._rep += 1;
                                        }).apply(this, msg._args);
                                    }, {});', mock).length

        it 'flx.get should return an 0-length array', ->
            assert.equal 0, flx('   flx.get("replyA", function capsule(msg) {
                                        (function replyA(req, res) {
                                          res.send("" + _rep);
                                          this._rep += 1;
                                        }).apply(this, msg._args);
                                    }, {});', mock).length

    describe 'some flx.register', ->
        it '1 flx.register should return an 1-length array', ->
            assert.equal 1, flx('   flx.register("replyA", function capsule(msg) {
                                        (function replyA(req, res) {
                                          res.send("" + _rep);
                                          this._rep += 1;
                                        }).apply(this, msg._args);
                                    }, {});', mock).length

        it '3 flx.register should return an 3-length array', ->
            assert.equal 3, flx('   flx.register("replyA", function capsule(msg) {
                                        (function replyA(req, res) {
                                          res.send("" + _rep);
                                          this._rep += 1;
                                        }).apply(this, msg._args);
                                    }, {});
                                    flx.register("replyA", function capsule(msg) {
                                        (function replyA(req, res) {
                                          res.send("" + _rep);
                                          this._rep += 1;
                                        }).apply(this, msg._args);
                                    }, {});
                                    flx.register("replyA", function capsule(msg) {
                                        (function replyA(req, res) {
                                          res.send("" + _rep);
                                          this._rep += 1;
                                        }).apply(this, msg._args);
                                    }, {});', mock).length

        it '3 flx.register + app.get should return an 3-length array', ->
            assert.equal 3, flx('   flx.register("replyA", function capsule(msg) {
                                        (function replyA(req, res) {
                                          res.send("" + _rep);
                                          this._rep += 1;
                                        }).apply(this, msg._args);
                                    }, {});
                                    app.get("/B", function placeholder() {
                                      return flx.start(flx.m("replyB", {
                                        _args: arguments,
                                        _sign: {}
                                      }));
                                    });
                                    flx.register("replyA", function capsule(msg) {
                                        (function replyA(req, res) {
                                          res.send("" + _rep);
                                          this._rep += 1;
                                        }).apply(this, msg._args);
                                    }, {});
                                    flx.register("replyA", function capsule(msg) {
                                        (function replyA(req, res) {
                                          res.send("" + _rep);
                                          this._rep += 1;
                                        }).apply(this, msg._args);
                                    }, {});', mock).length

        describe 'filter property', ->
            it '3 flx.register + app.get with one char add each time should return an 2-length array', ->
                v = ''
                acc = ->
                    o = v
                    v += 'A'
                    o
                assert.equal 2, flx('   flx.register("replyA", function capsule(msg) {
                                            (function replyA(req, res) {
                                              res.send("" + _rep);
                                              this._rep += 1;
                                            }).apply(this, msg._args);
                                        }, {});
                                        app.get("/B", function placeholder() {
                                          return flx.start(flx.m("replyB", {
                                            _args: arguments,
                                            _sign: {}
                                          }));
                                        });
                                        flx.register("replyA", function capsule(msg) {
                                            (function replyA(req, res) {
                                              res.send("" + _rep);
                                              this._rep += 1;
                                            }).apply(this, msg._args);
                                        }, {});
                                        flx.register("replyA", function capsule(msg) {
                                            (function replyA(req, res) {
                                              res.send("" + _rep);
                                              this._rep += 1;
                                            }).apply(this, msg._args);
                                        }, {});', acc).length
