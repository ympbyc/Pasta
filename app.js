var __ = require('Fw');

(function () {
  var Pasta = require('Pasta');

  var config = {
    'start': function (send) {
      send({notes: []});
    }
    , 'note-submit': function (send, state, data) {
      send({notes: state.notes.concat(data)});
    }
    , 'remove-note': function (send, state, data) {
      send({notes: __.remove(data)(state.notes)});
    }
  };
  
  var updateRule = {
    notes: function (UIAPI, tempState, oldState) {
      UIAPI.noteList.updateNotes(tempState.notes);
    }
  };
  
  var win = Ti.UI.createWindow();

  Pasta.UIHandler(
    Pasta.mainloopGenerator(config)
  , {noteList: require('noteListView')}
  , updateRule
  , win
  ).start();

  win.open();
}());