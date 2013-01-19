var __ = require('Fw');
var self = {};

function _add (ui1, ui2) {
  ui1.add(ui2);
  return ui2;
}

exports.initialize = function (parent, signal) {
  self.mainView = _add(parent, Ti.UI.createView({width:'100%',height:'100%', top:0, backgroundColor:'#green'}));

  self.mainView.hide();
};
exports.show = function () {
  self.mainView.show();
};
exports.hide = function () {
  self.mainView.hide();
}