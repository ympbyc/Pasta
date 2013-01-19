var __ = require('../Fw');

(function () {
  var Pasta = require('../Pasta');

  var config = {
    'start': function (send) {
      send({
        notes: []
      , page: 'noteList'
      });
    }
    , 'note-submit': function (send, state, data) {
      send({notes: state.notes.concat(data)});
    }
    , 'remove-note': function (send, state, data) {
      send({notes: __.remove(data)(state.notes)});
    }
    , 'page-to-noteList': function (send) {
      send({page: 'noteList'});
    }
    , 'page-to-page1': function (send) {
      send({page: 'page1'});
    }
  };
  
  var updateRule = {
    notes: function (UIAPI, tempState) {
      UIAPI.noteList.updateNotes(tempState.notes);
    }
  , page: function (UIAPI, tempState, oldVal) {
      switch (oldVal) {
        case 'page1'   : UIAPI.page1.hide(); break;
        case 'noteList': UIAPI.noteList.hide(); break;
      }
      switch (tempState.page) {
        case 'page1'   : UIAPI.page1.show(); break;
        case 'noteList': UIAPI.noteList.show(); break;
      }
    }
  };
  
  var win = Ti.UI.createWindow();

  Pasta.UIHandler(
    Pasta.mainloopGenerator(config)
  , {
      noteList: require('ui/noteListView')
    , page1: require('ui/page1')
    , tabs: require('ui/tabs')
    }
  , updateRule
  , win
  ).start();

  win.open();
}());