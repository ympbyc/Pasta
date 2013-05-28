(function( window ) {
    'use strict';

    window.PastaTodo = window.PastaTodo || {};

    var TODO_TEMPLATE = $("#todo-template").html();

    /* UI
     * UI helpers
     */
    PastaTodo.UI = _.module({}, render_todos, switch_filter, update_footer, toggle_visibility, todo_wrap, finish_edit);



    //refresh the entire list
    function render_todos (todos) {
        var $els = _.map(todos, todo_wrap);
        $("#todo-list").html(""); //clear
        _.each($els, function ($el) {
            $el.appendTo($("#todo-list"));
        });
    }



    //bold, unbold
    function switch_filter (new_filter, old_filter) {
        $("#" + old_filter).removeClass("selected");
        $("#" + new_filter).addClass("selected");
    }



    //adjust numbers
    function update_footer (todos) {
        var nums = _.countBy(todos, function (todo) {
            return todo.completed ? "completed" : "active";
        });
        $("#todo-count strong").text(nums.active || 0);
        if (nums.completed)
            $("#clear-completed").show().text("Clear completed (" + nums.completed + ")");
        else
            $("#clear-completed").hide();
    }



    //#main and #footer have to be hidden when no todo is available
    function toggle_visibility (v) {
        $("#main,#footer").toggle(!!v);
    }



    function todo_wrap (todo) {
        var $el = $("<div>").html(_.template(TODO_TEMPLATE, todo)).find("li");

        $el.find("label").dblclick(function () {
            $el.addClass("editing");
            $el.find(".edit").focus();
        });
        $el.find(".edit").keyup(function (e) {
            if (PastaTodo.Helper.enter_key(e.which)) finish_edit($(this), $el, todo);
        });
        $el.find(".edit").blur(function (e) {
            finish_edit($(this), $el, todo);
        });
        $el.find(".toggle").click(PastaTodo.pasta_signal("toggle_status", function () {
            return { completed: $(this).is(":checked"), todo: todo };
        }));
        $el.find(".destroy").click(PastaTodo.pasta_signal("destroy_todo", function () {
            return todo;
        }));

        return $el;
    }



    function finish_edit ($this, $el, todo) {
        $el.removeClass("editing");
        var title = $this.val();
        if (title) PastaTodo.pasta_signal("update")({ todo: todo, title: title });
        else PastaTodo.pasta_signal("destroy_todo")(todo);
    }



})( window );
