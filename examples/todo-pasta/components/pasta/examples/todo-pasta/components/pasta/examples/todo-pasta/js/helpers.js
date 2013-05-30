(function( window ) {
    'use strict';

    window.PastaTodo = window.PastaTodo || {};

    var ENTER_KEY = 13;

    var Helper = _.module({}, todo);

    //ensure that each todo created has `title` and `completed` keys.
    function todo (title, completed) {
        return {
            title:     title,
            completed: completed || false
        };
    }


    Helper.enter_key = _.eq(ENTER_KEY);

    //show modes
    Helper.show_all      = _.identity;
    Helper.show_active   = _.flippar(_.reject, _.flippar(_.at, "completed"));
    Helper.show_inactive = _.flippar(_.filter, _.flippar(_.at, "completed"));

    PastaTodo.Helper = Helper;

})( window );
