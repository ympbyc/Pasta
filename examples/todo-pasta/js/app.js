(function( window ) {
	'use strict';

  /* Construct a initial app */
  function initial_app () {
    //try to read from the localStorage
    var old_app = localStorage.getItem("pasta-todo");
    if (old_app) return JSON.parse(old_app);
    return {
      show_mode: "show_all",
      todos:     []
    };
  }

  /* Pasta
   * Throw everything into the pan to make a pasta plate
   */
  PastaTodo.pasta_signal = Pasta(PastaTodo.Model, PastaTodo.UI, PastaTodo.View, initial_app());

})( window );
