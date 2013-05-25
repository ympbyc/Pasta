(function( window ) {
  'use strict';

  //Controllers listen to DOM events and signals

  var signal = PastaTodo.pasta_signal;

  //Create a atodo on keyup
  $("#new-todo").keyup(function (e) {
    var title;
    if (PastaTodo.Helper.enter_key(e.which)) {
      title = $(this).val();
      $(this).val("");
      signal("add_todo")(title);
    }
  });

  //Clear Completed button
  $("#clear-completed").click(signal("clear_completed"));

  //The checkbox right next to #new-todo
  $("#toggle-all").click(signal("toggle_all", function () {
    return $(this).is(":checked");
  }));

})( window );
