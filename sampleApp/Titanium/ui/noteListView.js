var __ = require('Fw');
var self = {};

function _add (ui1, ui2) {
  ui1.add(ui2);
  return ui2;
}

exports.initialize = function (parent, signal) {
  self.mainView = _add(parent, Ti.UI.createView({width:'100%',height:'100%',backgroundColor:'#fff'}));
  var tf = _add(self.mainView, Ti.UI.createTextField({top:10, width:250,borderStyle:Ti.UI.INPUT_BORDERSTYLE_ROUNDED}));
  self.notesArea = _add(self.mainView, Ti.UI.createView({top:50, width:'100%',height:'100%',backgroundColor:'#bbb',layout:'vertical'}));

  tf.addEventListener('return', signal('note-submit', function (e) { var v = tf.value; tf.value = ''; return v; }));

  exports.updateNotes = function (notes) {
    __.each(function (ch) {
      self.notesArea.remove(ch);
    })(self.notesArea.children);

    __.each(function (note) {
      var l = _add(self.notesArea, Ti.UI.createLabel({top:5,text:note, backgroundColor:'yellow'}));
      l.addEventListener('click', signal('remove-note', function () { return note; }));
    })(notes);
  }
};
exports.show = function () {
  self.mainView.show();
};
exports.hide = function () {
  self.mainView.hide();
}
