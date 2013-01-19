var Pasta = (function () {
  var __ = require('./Fw');

  var UIHandler = function (mainloop, uiModules, updateRule, parentUI) {
    var UIAPI = {};      //namespace for functions that manipulate UIs
    var self = {};       //interface to the external world
    var appState = {};   //mutable application state
    
    var signal = function (ev_name, fn) {
      return function (e) {
        var val = fn ? fn(e) : e;
        mainloop(self, appState, ev_name, val);
      };
    };
  
    __.hashFold(uiModules, null, function (mdl, key) {
      UIAPI[key] = mdl;
    });
  
    function autoUpdate (patch) {
      var tempState = __.merge(appState, patch);
      __.hashFold(patch, null, function (change, key) {
        if (!appState[key]) return;
        if (updateRule[key] !== undefined) updateRule[key](UIAPI, tempState, appState[key]);
      });
    }
  
    self.start = function () {
      __.hashFold(UIAPI, null, function (mdl, key) {
        if (UIAPI[key].initialize) UIAPI[key].initialize(parentUI, signal);
      });
      signal('start')();
    };
  
    self.modifyState = function (patch) {
      autoUpdate(patch);       //apply changes to UIs
      __._merge(appState, patch); //destructively update appState
    };
  
    return self;
  };
  
  var mainloopGenerator = function (config) {
    return function (api, state, ev, ev_val) {
      var kont = function (patch) { api.modifyState(patch); };
      config[ev](kont, state, ev_val);
    };
  };

  return {
    mainloopGenerator: mainloopGenerator
  , UIHandler: UIHandler
  , __: __
  };
}());

module.exports = Pasta;
