(function( window ) {
	'use strict';

  /* Pasta
   * Throw everything into the pan to make a pasta plate
   */
  PastaTodo.pasta_signal = Pasta(PastaTodo.Model, PastaTodo.UI, PastaTodo.View);

  $(PastaTodo.pasta_signal("init_app"));

})( window );
