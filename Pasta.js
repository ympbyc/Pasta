/*
 * Pasta.js
 *
 * Mostly Functional MVC framework
 *
 * 2013 Minori Yamashita <ympbyc@gmail.com>
 */

var Pasta = (function () {

  //Hide informations that are not necessary for appRule actor, but for execution
  var mainloopGenerator = function (config, api, signal) {
    return function (state, ev, ev_val) {
      var kont = function (patch) { api.modifyState(patch); };
      kont(config[ev](state, ev_val, signal)); //no longer passes `send`
    };
  };


  var UIHandler = function (appModel, UIAPI, updateRule, parentUI, initState) {
    var self = {};       //interface to the external world
    var appState = initState || {};   //mutable application state
    var mainloop = mainloopGenerator(appModel, self, signal);

    //`signal` function is given to UI actors on construction time, UI actors send messages to appRule actors
    // through this function.
    //`signal` have to be defined here because it accesses the closed mutable value `appState`
    function signal (ev_name, fn) {
      return function (e) {
        var val = fn ? fn(e) : e;
        setTimeout(function () {
            mainloop(appState, ev_name, val);
        }, 0);
      };
    };

    //Send messages to View actor.
    //Each message has a pattern `.changedVal (hash_of_UI_actors, copy_of_patched_appState, old_value)`
    function autoUpdate (patch) {
      var tempState = _.merge(appState, patch);
      _.foldl(patch, function (acc, change, key) {
        if (updateRule[key] !== undefined) updateRule[key](UIAPI, tempState, appState[key]);
      }, null);
    }

    //call `autoUpdate`. When done, merge the patch to the current appState
    self.modifyState = function (patch) {
      autoUpdate(patch);         //apply changes to UIs
      _.extend(appState, patch); //destructively update appState
    };

    //since 2013/4/10
    //expose signal
    self.signal = signal;

    return self;
  };

  //Pasta() is UIHandler
  return UIHandler;

}());

if (typeof module !== "undefined") module.exports = Pasta;
else this.Pasta = Pasta;
