$(function () {
  var Pasta = require('../../Pasta');
  var __ = Pasta.__;

  //model constructor
  function TodoItem (memo, id, checked) {
    return {id: id, memo: memo, checked: checked};
  };

  var appModel = {
    'start': function (send) {
      send({
        todos: []
      , curId: 0
      });
    }
  , 'todo-add': function (send, state, memo) {
      var id = state.curId+1;
      send({curId:id, todos: state.todos.concat(TodoItem(memo, id, false))});
    }
  , 'todo-remove': function (send, state, id) {
      send({todos: __.filter(function (it) { return it.id !== id })(state.todos)});
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
  };

  var view = {
    id: function (UIAPI, state) {
    }
  , todos: function (UIAPI, state) {
      UIAPI.todoList.renderTodos(state.todos);
      UIAPI.todoList.renderCounter(state.todos.length);
    }
  };


  var todoTemplate = '<li class="{{completed}}">\
    <div class="view">\
      <input class="toggle" type="checkbox" data-id="{{id}}" {{checked_}} >\
      <label>{{memo}}</label>\
      <button class="destroy" data-id="{{id}}"></button>\
    </div>\
    <input class="edit" value="{{memo}}">\
  </li>';

  var todoListUI = {
    initialize: function (_, signal) {
      var $newTodo = $('#new-todo');
      $newTodo.on('keypress', function (e) {
        if (e.keyCode === 13)  {
          signal('todo-add')($newTodo.val());
          $newTodo.val('');
        }
      });

      $('#todo-list').on('refresh', function () {
        $('.destroy').click(signal('todo-remove', function (e) {return parseInt($(e.target).attr('data-id')); }));
        $('.toggle').click(signal('todo-stat-change', function (e) { 
          var t = $(e.target);
          return {id: parseInt(t.attr('data-id')), checked: ! t.attr('checked')}; 
        }));
      });
    }
  , renderCounter: function (n) {
      $('#todo-count strong').text(n);
    }
  , renderTodos: function (todos) {
      $('#todo-list').html(__.fold(function (todo, str) {
        var item = __.merge(todo, {
          checked_: todo.checked ? 'checked' : ''
        , completed:todo.checked ? 'completed' : ''
        });
        return str + __.template(todoTemplate, item);
      }, "")(todos));
      $('#todo-list').trigger('refresh');
    }
  };

  Pasta.UIHandler(
    Pasta.mainloopGenerator(appModel)
  , {todoList:todoListUI}
  , view
  , $('#todo-content')
  ).start();

});