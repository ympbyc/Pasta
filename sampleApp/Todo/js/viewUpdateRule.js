var updateRule = {
  id: function (UI, state) {
  }
, todos: function (UI, state) {
    UI.todoList.renderTodos(state.todos);
    UI.todoList.renderCounter(state.todos.length);
  }
, filter: function (UI, state) {
    UI.todoList.renderTodos(state.todos.filter(state.filter));
  }
, route: function (UI, state, old) {
    UI.todoList.selectLink(state.route, old);
  }
};

module.exports = updateRule;
