/*
 * Pasta.js
 *
 * 2013 Minori Yamashita <ympbyc@gmail.com>
 */

var Pasta = (function () {
    /*** private ***/


    function reset_BANG_ (app, state) {
        app._state = state;
        return app;
    }

    function get_watcher (app, key) {
        return app._watchers[key];
    }

    function add_watch (app, key, f) {
        app._watchers[key] = f;
        return app;
    }


    /*** public ***/

    function app (x) {
        return {_state: x, _watchers: {}};
    }

    function deref (app) {
        return app._state;
    }


    /**
     * deftransition :: ({state} * ... -> {patch}) -> (App * ... -> undefined)
     */
    function deftransition (f) {
        return _.optarg(function (app, args) {
            var old_s = deref(app);
            var diff  = _.apply(_.partial(f, old_s), args);
            var new_s = _.merge(old_s, diff);
            _.each(diff, function (__, key_changed) {
                var watcher = get_watcher(app, key_changed);
                if (watcher) watcher(new_s, old_s);
            });
            reset_BANG_(app, new_s);
        });
    }


    /**
     * watch_transition :: App * String * ({new state} * {old state} -> undefined) -> undefined
     */
    var watch_transition = add_watch;


    return {
        app:              app,
        deref:            deref,
        deftransition:    deftransition,
        watch_transition: watch_transition
    };
}());
