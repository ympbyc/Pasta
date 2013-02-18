window.Pasta = require('../../Pasta');
window.__ = Pasta.__;

$(function () {

  Pasta(
    require('./appModel')
  , {
      todoList: require('./ui/todoList')
    , cron: require('./ui/cron')
    }
  , require('./viewUpdateRule')
  , $('#todo-content')
  ).start();

});
