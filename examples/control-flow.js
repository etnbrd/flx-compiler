/*  In this example, the compiler cannot know statically wether fn1 or fn2 will be used.
 *  If only fn1 is used, then all fluxions (begin, fn1, fn2 and end) have independent values of a.
 *  If only fn2 is used, then the fluxions begin and fn2 need to be kept grouped, because begin uses a before its modification downstream by fn2.
 *  This example shows the problem with unknown downstream fluxions
 */

var a = 0;

async(function begin() {
  console.log('begin : ' + a);
  if (Math.random() > 0.5)
    async(fn1);
  else
    async(fn2);
})

function fn1() {
  async(a, end);
}

function fn2() {
  a += 1;
  async(a, end);
}

function end(a) {
  console.log(a);
}

// ----------------------------------------------------

function async() {
  var args = Array.prototype.slice.call(arguments);
  var cb = args.pop();
  setTimeout(function() {
    cb.apply(this, args);
  }, 0);
}