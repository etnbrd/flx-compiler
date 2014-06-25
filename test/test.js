var assert = require("assert");

var t = require("./tools");

describe('Test Cases', function(){
  describe('Problem #1', function(){
    it('should compile problem #1', function(done){
      t.compileFile("count1.js");

      after(function() {
        s()
      });

      var s = t.server("count1.js", function(data) {
        if (data == ">> listening 8080\n") {
          t.client(function (body) {
            if (body == "42")
              done();
          });
        }
      })

    })
  })

  describe('Problem #2', function(){
    it('should compile problem #2', function(done){
      t.compileFile("count2.js");

      after(function() {
        s()
      });

      var s = t.server("count2.js", function(data) {
        if (data == ">> listening 8080\n") {
          t.client(function (body) {
            if (body == "42")
              done();
          });
        }
      })

    })
  })

  describe('Problem #3', function(){
    it('should compile problem #3', function(done){
      t.compileFile("count3.js");

      after(function() {
        s()
      });

      var s = t.server("count3.js", function(data) {
        if (data == ">> listening 8080\n") {
          t.client(function (body) {
            if (body == "42")
              done();
          });
        }
      })

    })
  })
})