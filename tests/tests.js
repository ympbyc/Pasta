var se = strictEqual;

module("pasta");

var Model = _.module(
    {},

    function change_name (state, data, signal) {
        test("model", function () {
            se(state.user.age, 19, "State has the right value");
            se(data, "Dave", "date is passed as the second argument");
            se(typeof signal, "function", "signal is passed as the third argument");
        });
        return {user: _.assoc(state.user, 'name', data)};
    },

    function harmless () {
        return {};
    }
);

var UI = _.module(
    {},

    function change_name (name) {
        test("UI", function () {
            se(name, "Dave", "ok");
        });
    }
);

var View = _.module(
    {},

    function user (UI, state, oldVal) {
        test("view1", function () {
            se(state.user.name, "Dan", "initial event firing");
            se(typeof UI.change_name, "function", "UI module is passed in");
            se(oldVal.name, "Dan", "old value is passed in");
        });
        _.module(View,
                 function user (UI, state, oldVal) {
                     test("view2", function () {
                         se(state.user.name, "Dave", "The change properly propagated to the view");
                         se(oldVal.name, "Dan", "old value is passed in");
                     });
                 });
    }
);

var initialState = {
    user: {name: "Dan", age: 19}
};

var signal = Pasta(Model, UI, View, initialState);

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
