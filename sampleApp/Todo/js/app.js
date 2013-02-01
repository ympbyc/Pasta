window.Pasta = require('../../Pasta');
window.__ = Pasta.__;

$(function () {

  var appModel = require('./appModel');

  var viewUpdateRule = require('./viewUpdateRule');

  Pasta(
    appModel
  , {todoList: require('./ui/todoList')}
  , viewUpdateRule
  , $('#todo-content')
  ).start();

});
