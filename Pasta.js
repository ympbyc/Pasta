/*
 * Pasta.js
 *
 * Actor-based MVC framework
 *
 * 2013 Minori Yamashita <ympbyc@gmail.com>
 */

var Pasta = (function () {
  var __ = require('./Fw');

  //Hide informations that are not necessary for appRule actor, but for execution
  var mainloopGenerator = function (config, api) {
    return function (state, ev, ev_val) {
      var kont = function (patch) { api.modifyState(patch); };
      config[ev](kont, state, ev_val);
    };
  };


  var UIHandler = function (appModel, UIAPI, updateRule, parentUI) {
    var self = {};       //interface to the external world
    var appState = {};   //mutable application state
    var mainloop = mainloopGenerator(appModel, self);

    //`signal` function is given to UI actors on construction time, UI actors send messages to appRule actors
    // through this function.
    //`signal` have to be defined here because it accesses the closed mutable value `appState`
    function signal (ev_name, fn) {
      return function (e) {
        var val = fn ? fn(e) : e;
        mainloop(appState, ev_name, val);
      };
    };

    //Send messages to View actor.
    //Each message has a pattern `.changedVal (hash_of_UI_actors, copy_of_patched_appState, old_value)`
    function autoUpdate (patch) {
      var tempState = __.merge(appState, patch);
      __.hashFold(patch, null, function (change, key) {
        if (updateRule[key] !== undefined) updateRule[key](UIAPI, tempState, appState[key]);
      });
    }

    //DEPRECATED
    //initialize each view actors
    //app.js should send this
    self.start = function () {
      if (console) console.log("WARNING: Using a deprecated feature: start");
      __.hashFold(UIAPI, null, function (mdl, key) {
        if (UIAPI[key].initialize) UIAPI[key].initialize(parentUI, signal);
      });
      signal('start')();
    };

    //call `autoUpdate`. When done, merge the patch to the current appState
    self.modifyState = function (patch) {
      autoUpdate(patch);       //apply changes to UIs
      __._merge(appState, patch); //destructively update appState
    };

    //since 2013/4/10
    //expose signal
    self.signal = signal;

    return self;
  };

  //Pasta() is UIHandler

  UIHandler.__ = __;
  return UIHandler;

}());

module.exports = Pasta;
