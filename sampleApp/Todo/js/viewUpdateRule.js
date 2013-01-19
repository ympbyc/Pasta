var updateRule = {
  id: function (UIAPI, state) {
  }
  , todos: function (UIAPI, state) {
    UIAPI.todoList.renderTodos(state.todos);
    UIAPI.todoList.renderCounter(state.todos.length);
  }
};

module.exports = updateRule;