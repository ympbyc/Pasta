var __ = require('Fw');
var self = {};

function _add (ui1, ui2) {
  ui1.add(ui2);
  return ui2;
}

exports.initialize = function (parent, signal) {
  self.tabbar = _add(parent, Ti.UI.createView({width:'100%',height:40, bottom:0}));
  var noteTab  = _add(self.tabbar, Ti.UI.createButton({width:'50%',left:0,title:'Notes'}));
  var page1Tab = _add(self.tabbar, Ti.UI.createButton({width:'50%',left:'50%',title:'Page1'}));

  noteTab.addEventListener('click', signal('page-to-noteList'));
  page1Tab.addEventListener('click', signal('page-to-page1'));
};
