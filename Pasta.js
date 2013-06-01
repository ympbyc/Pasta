/*
 * Pasta.js
 *
 * Mostly Functional MVC framework
 *
 * 2013 Minori Yamashita <ympbyc@gmail.com>
 */

var Pasta = (function () {

  if (typeof Object.freeze === "undefined")
    Object.freeze = _.identity;

  //Hide informations that are not necessary for the model, but for execution
  var mainloopGenerator = function (config, modifyState, signal) {
    return function (state, ev, ev_val) {
      modifyState(config[ev](state, ev_val, signal));
    };
  };


  var Pasta = function (appModel, UIAPI, updateRule, initState) {
    var self = {};       //interface to the external world
    var appState = initState || {};   //mutable application state
    var mainloop = mainloopGenerator(appModel, modifyState, signal);

    //`signal` have to be defined here because it accesses the closed mutable value `appState`
    function signal (ev_name, fn) {
      return function (e) {
        var val = fn ? fn.bind(this)(e) : e;
        setTimeout(function () {
            mainloop(appState, ev_name, val);
        }, 0);
      };
    };

    //Call appropriate functions of the view
    function autoUpdate (patch) {
      var tempState = Object.freeze(_.merge(appState, patch));
      _.foldl(patch, function (acc, change, key) {
        if (updateRule[key] !== undefined) updateRule[key](UIAPI, tempState, appState[key]);
      }, null);
    }

    //call `autoUpdate`. When done, merge the patch to the current appState
    function modifyState (patch) {
      autoUpdate(patch);                   //apply changes to UIs
      appState = _.merge(appState, patch); //destructively update appState
      Object.freeze(appState);             //freeze!
    };

    modifyState(initState); //init

    return signal;
  };

  return Pasta;

}());

if (typeof module !== "undefined") module.exports = Pasta;
else this.Pasta = Pasta;
