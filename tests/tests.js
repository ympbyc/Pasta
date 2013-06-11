var se = strictEqual;

module("pasta");

var Model = _.module({}, change_name, harmless);

function change_name (state, data, signal) {
    test("model", function () {
        se(state.user.age, 19, "State has the right value");
        se(data, "Dave", "date is passed as the second argument");
        se(typeof signal, "function", "signal is passed as the third argument");
    });
    return {user: [_.conj, { name: data }]};
}

function harmless (st) {
    console.log(st);
    return {};
}


var UI = _.module({}, render_name);

function render_name (name) {
    test("UI", function () {
        se(name, "Dave", "ok");
    });
}

var View = _.module({}, user);

var first_test = true;

function user (UI, state, oldVal) {
    if (first_test) {
        first_test = false;
        test("view1", function () {
            se(state.user.name, "Dan", "initial event firing");
            se(typeof UI.render_name, "function", "UI module is passed in");
            se(oldVal.name, "Dan", "old value is passed in");
        });
    }
    else
        test("view2", function () {
            se(state.user.name, "Dave", "The change properly propagated to the view");
            se(oldVal.name, "Dan", "old value is passed in");
        });
}


var initialState = {
    user: {name: "Dan", age: 19}
};

var signal = Pasta(Model, UI, View, initialState, true, [
    {model: {model_plugin: function (st) {
        test('plugin', function () {
            se(st.user.name, "Dave", "Plugin is invoked");
        });
    }}}]);

test("Pasta", function () {
    se(typeof signal, "function", "Pasta exports signal");
});

signal("change_name", function (e) {
    test("signal", function () {
        se(e.val, "Dave", "The function has access to event object");

        try {
            $('<div data-id="test123">').on("foo", signal("harmless", function () {
                se($(this).attr("data-id"), "test123", "The function has access to this");
            })).trigger("foo");
        } catch (err) {console.log(err);}

    });

    return e.val;
})({val: "Dave"});

signal("model_plugin")();
