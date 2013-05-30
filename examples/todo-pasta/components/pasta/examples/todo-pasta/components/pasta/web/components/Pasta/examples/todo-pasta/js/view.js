(function( window ) {
  'use strict';

  window.PastaTodo = window.PastaTodo || {};

  /* View
   * View is a set of functions that maps the changes made to the app to its UI
   */
  PastaTodo.View = _.module(
    {},

    function todos (UI, app) {
      UI.render_todos(PastaTodo.Helper[app.show_mode](app.todos));
      UI.update_footer(app.todos);
      UI.toggle_visibility(_.size(app.todos));
      PastaTodo.pasta_signal("save_app")(); //save the app everytime todos change
    },

    function show_mode (UI, app, old_val) {
      UI.render_todos(PastaTodo.Helper[app.show_mode](app.todos));
      UI.switch_filter(app.show_mode, old_val);
    }
  );

})( window );