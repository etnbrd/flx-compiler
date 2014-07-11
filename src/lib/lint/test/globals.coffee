assert = require 'assert'
globals = require '../globals'
esprima = require 'esprima'
escope = require 'escope'

load = (code, n) ->
    ast = esprima.parse(code, { loc: true, range: true })
    globals escope.analyze(ast).scopes[n]

describe 'globals', ->
    describe 'no global variable accessed', ->
        describe 'no global variable', ->
            describe 'no variable', ->
                describe 'no argument', ->
                    it 'return 1 should return an empty array', ->
                        assert.deepEqual [], load(' function y() {
                                                        return 1;
                                                    }', 1)

                    it 'use arguments should return an empty array', ->
                        assert.deepEqual [], load(' function y() {
                                                        return arguments[1];
                                                    }', 1)

                    it 'use this should return an empty array', ->
                        assert.deepEqual [], load(' function y() {
                                                        return this.a;
                                                    }', 1)

                describe 'one argument', ->
                    it 'not used should return an empty array', ->
                        assert.deepEqual [], load(' function y(b) {
                                                        return 1;
                                                    }', 1)

                    it 'used should return an empty array', ->
                        assert.deepEqual [], load(' function y(b) {
                                                        return b+1;
                                                    }', 1)

                    it 'use arguments should return an empty array', ->
                        assert.deepEqual [], load(' function y(b) {
                                                        return b+arguments[1];
                                                    }', 1)

                    it 'use this should return an empty array', ->
                        assert.deepEqual [], load(' function y(b) {
                                                        return b+this.a;
                                                    }', 1)

                    it 'recursive call should return an empty array', ->
                        assert.deepEqual [], load(' function y(b) {
                                                        return b(y);
                                                    }', 1)

            describe 'a variable', ->
                describe 'not accessed', ->
                    describe 'no argument', ->
                        it 'return 1 should return an empty array', ->
                            assert.deepEqual [], load(' function y() {
                                                            var l = 2;
                                                            return 1;
                                                        }', 1)

                        it 'use arguments should return an empty array', ->
                            assert.deepEqual [], load(' function y() {
                                                            var l = 2;
                                                            return arguments[1];
                                                        }', 1)

                        it 'use this should return an empty array', ->
                            assert.deepEqual [], load(' function y() {
                                                            var l = 2;
                                                            return this.a;
                                                        }', 1)

                    describe 'one argument', ->
                        it 'not used should return an empty array', ->
                            assert.deepEqual [], load(' function y(b) {
                                                            var l = 2;
                                                            return 1;
                                                        }', 1)

                        it 'used should return an empty array', ->
                            assert.deepEqual [], load(' function y(b) {
                                                            var l = 2;
                                                            return b+1;
                                                        }', 1)

                        it 'use arguments should return an empty array', ->
                            assert.deepEqual [], load(' function y(b) {
                                                            var l = 2;
                                                            return b+arguments[1];
                                                        }', 1)

                        it 'use this should return an empty array', ->
                            assert.deepEqual [], load(' function y(b) {
                                                            var l = 2;
                                                            return b+this.a;
                                                        }', 1)

                        it 'recursive call should return an empty array', ->
                            assert.deepEqual [], load(' function y(b) {
                                                            var l = 2;
                                                            return b(y);
                                                        }', 1)

                describe 'accessed', ->
                    describe 'no argument', ->
                        it 'return 1 should return an empty array', ->
                            assert.deepEqual [], load(' function y() {
                                                            var l = 2;
                                                            return 1+l;
                                                        }', 1)

                        it 'use arguments should return an empty array', ->
                            assert.deepEqual [], load(' function y() {
                                                            var l = 2;
                                                            return arguments[1]+l;
                                                        }', 1)

                        it 'use this should return an empty array', ->
                            assert.deepEqual [], load(' function y() {
                                                            var l = 2;
                                                            return this.a+l;
                                                        }', 1)

                    describe 'one argument', ->
                        it 'not used should return an empty array', ->
                            assert.deepEqual [], load(' function y(b) {
                                                            var l = 2+l;
                                                            return 1;
                                                        }', 1)

                        it 'used should return an empty array', ->
                            assert.deepEqual [], load(' function y(b) {
                                                            var l = 2;
                                                            return b+1+l;
                                                        }', 1)

                        it 'use arguments should return an empty array', ->
                            assert.deepEqual [], load(' function y(b) {
                                                            var l = 2;
                                                            return b+arguments[1]+l;
                                                        }', 1)

                        it 'use this should return an empty array', ->
                            assert.deepEqual [], load(' function y(b) {
                                                            var l = 2;
                                                            return b+this.a+l;
                                                        }', 1)

                        it 'recursive call should return an empty array', ->
                            assert.deepEqual [], load(' function y(b) {
                                                            var l = 2;
                                                            return b(y)+l;
                                                        }', 1)

    describe 'a global variable', ->
            describe 'no variable', ->
                describe 'no argument', ->
                    it 'return 1 should return an empty array', ->
                        assert.deepEqual [], load(' var a = 42;
                                                    function y() {
                                                        return 1;
                                                    }', 1)

                    it 'use arguments should return an empty array', ->
                        assert.deepEqual [], load(' var a = 42;
                                                    function y() {
                                                        return arguments[1];
                                                    }', 1)

                    it 'use this should return an empty array', ->
                        assert.deepEqual [], load(' var a = 42;
                                                    function y() {
                                                        return this.a;
                                                    }', 1)

                describe 'one argument', ->
                    it 'not used should return an empty array', ->
                        assert.deepEqual [], load(' var a = 42;
                                                    function y(b) {
                                                        return 1;
                                                    }', 1)

                    it 'used should return an empty array', ->
                        assert.deepEqual [], load(' var a = 42;
                                                    function y(b) {
                                                        return b+1;
                                                    }', 1)

                    it 'use arguments should return an empty array', ->
                        assert.deepEqual [], load(' var a = 42;
                                                    function y(b) {
                                                        return b+arguments[1];
                                                    }', 1)

                    it 'use this should return an empty array', ->
                        assert.deepEqual [], load(' var a = 42;
                                                    function y(b) {
                                                        return b+this.a;
                                                    }', 1)

                    it 'recursive call should return an empty array', ->
                        assert.deepEqual [], load(' var a = 42;
                                                    function y(b) {
                                                        return b(y);
                                                    }', 1)

            describe 'a variable', ->
                describe 'not accessed', ->
                    describe 'no argument', ->
                        it 'return 1 should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return 1;
                                                        }', 1)

                        it 'use arguments should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return arguments[1];
                                                        }', 1)

                        it 'use this should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return this.a;
                                                        }', 1)

                    describe 'one argument', ->
                        it 'not used should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return 1;
                                                        }', 1)

                        it 'used should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+1;
                                                        }', 1)

                        it 'use arguments should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+arguments[1];
                                                        }', 1)

                        it 'use this should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+this.a;
                                                        }', 1)

                        it 'recursive call should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b(y);
                                                        }', 1)

                describe 'accessed', ->
                    describe 'no argument', ->
                        it 'return 1 should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return 1+l;
                                                        }', 1)

                        it 'use arguments should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return arguments[1]+l;
                                                        }', 1)

                        it 'use this should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return this.a+l;
                                                        }', 1)

                    describe 'one argument', ->
                        it 'not used should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y(b) {
                                                            var l = 2+l;
                                                            return 1;
                                                        }', 1)

                        it 'used should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+1+l;
                                                        }', 1)

                        it 'use arguments should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+arguments[1]+l;
                                                        }', 1)

                        it 'use this should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+this.a+l;
                                                        }', 1)

                        it 'recursive call should return an empty array', ->
                            assert.deepEqual [], load(' var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b(y)+l;
                                                        }', 1)

    describe 'a global variable accessed', ->
        describe 'no variable', ->
            describe 'no argument', ->
                it 'return 1 should return [a]', ->
                    assert.deepEqual ['a'], load('  var a = 42;
                                                    function y() {
                                                        return a;
                                                    }', 1)

                it 'use arguments should return [a]', ->
                    assert.deepEqual ['a'], load(' var a = 42;
                                                    function y() {
                                                        return arguments[1]+a;
                                                    }', 1)

                it 'use this should return [a]', ->
                    assert.deepEqual ['a'], load(' var a = 42;
                                                    function y() {
                                                        return this.a+a;
                                                    }', 1)

            describe 'one argument', ->
                it 'not used should return [a]', ->
                    assert.deepEqual ['a'], load('  var a = 42;
                                                    function y(b) {
                                                        return 1+a;
                                                    }', 1)

                it 'used should return [a]', ->
                    assert.deepEqual ['a'], load('  var a = 42;
                                                    function y(b) {
                                                        return b+1+a;
                                                    }', 1)

                it 'use arguments should return [a]', ->
                    assert.deepEqual ['a'], load('  var a = 42;
                                                    function y(b) {
                                                        return b+arguments[1]+a;
                                                    }', 1)

                it 'use this should return [a]', ->
                    assert.deepEqual ['a'], load('  var a = 42;
                                                    function y(b) {
                                                        return b+this.a+a;
                                                    }', 1)

                it 'recursive call should return [a]', ->
                    assert.deepEqual ['a'], load('  var a = 42;
                                                    function y(b) {
                                                        return b(y)+a;
                                                    }', 1)

        describe 'a variable', ->
            describe 'not accessed', ->
                describe 'no argument', ->
                    it 'return 1 should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return 1+a;
                                                        }', 1)

                    it 'use arguments should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return arguments[1]+a;
                                                        }', 1)

                    it 'use this should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return this.a+a;
                                                        }', 1)

                describe 'one argument', ->
                    it 'not used should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return 1+a;
                                                        }', 1)

                    it 'used should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+1+a;
                                                        }', 1)

                    it 'use arguments should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+arguments[1]+a;
                                                        }', 1)

                    it 'use this should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+this.a+a;
                                                        }', 1)

                    it 'recursive call should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b(y)+a;
                                                        }', 1)

            describe 'accessed', ->
                describe 'no argument', ->
                    it 'return 1 should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return 1+l+a;
                                                        }', 1)

                    it 'use arguments should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return arguments[1]+l+a;
                                                        }', 1)

                    it 'use this should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y() {
                                                            var l = 2;
                                                            return this.a+l+a;
                                                        }', 1)

                describe 'one argument', ->
                    it 'not used should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y(b) {
                                                            var l = 2+l+a;
                                                            return 1;
                                                        }', 1)

                    it 'used should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+1+l+a;
                                                        }', 1)

                    it 'use arguments should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+arguments[1]+l+a;
                                                        }', 1)

                    it 'use this should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b+this.a+l+a;
                                                        }', 1)

                    it 'recursive call should return [a]', ->
                        assert.deepEqual ['a'], load('  var a = 42;
                                                        function y(b) {
                                                            var l = 2;
                                                            return b(y)+l+a;
                                                        }', 1)

