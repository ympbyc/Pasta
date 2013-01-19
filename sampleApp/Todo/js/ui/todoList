var todoTemplate = '<li class="{{completed}}">\
  <div class="view">\
    <input class="toggle" type="checkbox" data-id="{{id}}" {{checked_}} >\
    <label>{{memo}}</label>\
    <button class="destroy" data-id="{{id}}"></button>\
  </div>\
  <input class="edit" value="{{memo}}">\
</li>';


exports.initialize = function (_, signal) {
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
};

exports.renderCounter = function (n) {
  $('#todo-count strong').text(n);
};

exports.renderTodos = function (todos) {
  $('#todo-list').html(__.fold(function (todo, str) {
    var item = __.merge(todo, {
      checked_: todo.checked ? 'checked' : ''
      , completed:todo.checked ? 'completed' : ''
    });
    return str + __.template(todoTemplate, item);
  }, "")(todos));
  $('#todo-list').trigger('refresh');
};