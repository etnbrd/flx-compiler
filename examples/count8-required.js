var _rep = 42;

module.exports = function replyA(req, res){
  _rep += 1;
  res.send("" + _rep);
};