//model constructor
function TodoItem (memo, id, checked) {
  return {id: id, memo: memo, checked: checked};
};

var appModel = {
  'start': function (send) {
    send({
      todos: []
    , curId: 0
    , route: location.hash
    , filter: function (_) { return true; }
    });
  }

, 'todo-add': function (send, state, memo) {
    var id = state.curId+1;
    send({curId:id, todos: state.todos.concat(TodoItem(memo, id, false))});
  }

, 'todo-remove': function (send, state, id) {
    send({todos: __.filter(function (it) { return it.id !== id; })(state.todos)});
  }

, 'todo-stat-change': function (send, state, item) {
    send({
      todos: __.map(function (it) {
        if (it.id !== item.id) return it;
        it.checked = item.checked;
        return it;
      })(state.todos)
    });
  }

, 'to-active': function (send) {
    send({
      filter: function (x) { return ! x.checked;  }
    , route: '#/active'
    });
  }

, 'to-completed': function (send) {
    send({
      filter: function (x) { return x.checked; }
    , route: '#/completed'
    });
  }

, 'to-all': function (send) {
    send({
      filter: function () { return true; }
    , route: '#/'
    });
  }

};

module.exports = appModel;
