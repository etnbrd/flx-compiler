module.exports = {

  Identifier: {
    enter: function(n, c) {
      c.id += (c.id === "" ? "" : ".") + n.name;
    }
  }
};

// function _getId(c) {

//   function _enter(n) {
//     if(n.type === "Identifier") {
//       c.id += (c.id === "" ? "" : ".") + n.name;
//     }
//   }

//   function _leave(n) {

//   }

//   function aggregate(prev, n) {

//   }

//   return {
//     enter: _enter,
//     leave: _leave
//   }

// }

// var _types = {};

// _types.Identifier = {
//   enter: function(n, c) {
//     return c.id += (c.id === "" ? "" : ".") + n.name;
//   }
// }

/*  OLD  */
// var getId = {
//   enter : function(n) {
//     return n;
//   },
//   leave : function(n, res) {

//   },
//   aggregate : function(prev, n) {

//     // if (!prev)
//     //   return n;

//     if (n.type === "MemberExpression") {
//       if (n.computed) {
//         return prev + "[";
//       } else {
//         return prev + ".";
//       }
//     }

//     if (n.type === "Identifier") {
//       return prev + n.name;
//     }
//   },
//   init: {
//     al: "",
//     om: ""
//   }
// }
