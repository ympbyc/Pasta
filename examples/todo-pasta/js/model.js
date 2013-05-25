(function( window ) {
  'use strict';

  window.PastaTodo = window.PastaTodo || {};

  /* Model
   * Model is a set of functions that may patch the app.
   */
  PastaTodo.Model = _.module(
    {},
    
    //add a new todo entry
    function add_todo (app, title) {
      //Spec says "Make sure to .trim() the input and then check that it's not empty before creating a new todo."
      var trimmed_title = title.trim();
      if (_.isEmpty(trimmed_title)) return {};
      return { todos: app.todos.concat(PastaTodo.Helper.todo(title)) };
    },

    //update
    function update (app, data) {
      return { todos: _.map(app.todos, function (todo) {
        if (todo === data.todo) return _.assoc(todo, 'title', data.title);
        return todo;
      }) };
    },

    //data.completed === true ? completed : active
    function toggle_status (app, data) {
      return { todos: _.map(app.todos, function (todo) {
        if (todo === data.todo) return _.assoc(todo, 'completed', data.completed);
        return todo;
      }) };
    },

    //clear completed
    function clear_completed (app) {
      return { todos: _.reject(app.todos, _.flippar(_.at, "completed")) };
    },

    //mark every todo as either complete or active
    function toggle_all (app, completed) {
      return { todos: _.map(app.todos, _.flippar(_.conj, {completed: completed})) };
    },

    //One of Pasta's selling point is the ability to save the entire running app
    function save_app (app) {
      localStorage.setItem("pasta-todo", JSON.stringify(app));
    },

    //routing
    function change_show_mode (app, mode) {
      return { show_mode: mode };
    }
  );

})( window );