(function( window ) {
  'use strict';

  var signal = PastaTodo.pasta_signal;

  /* Routing
   * Routing isn't built in to Pasta so we follow the spec and use director.
   */
  Router({
    "/":          signal("change_show_mode", function () { return "show_all" }),
    "/active":    signal("change_show_mode", function () { return "show_active" }),
    "/completed": signal("change_show_mode", function () { return "show_inactive" })
  }).init();

})( window );