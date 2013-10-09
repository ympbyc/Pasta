with (Pasta)

(function () {
    var se = strictEqual;
    var de = deepEqual;
    module("pasta");

    var initial_state = {name:    "David",
                         friends: ["Kei", "Harry", "Simon"]};
    var test_app = app(initial_state);

    var new_friend = deftransition(function (state, name) {
        return { friends: _.conj(state.friends, name) };
    });

    var bye_friend = deftransition(function (state, name) {
        return { friends: _.reject(state.friends, _.eq(name)) };
    });

    var view_mock = "";

    function message (x) {
        return _.simplate("{{name}} has {{friends_count}} friends: {{friends}}."
                          + " He lost {{lost_friends}}.",
                          x);
    }

    watch_transition(test_app, "friends", function (new_s, old_s) {
        view_mock =
            message({name: new_s.name,
                     friends_count: _.size(new_s.friends),
                     friends: _.join(new_s.friends, ", "),
                     lost_friends: _.join(_.difference(old_s.friends, new_s.friends), ", ")});
    });


    test("init", function () {
        de(deref(test_app), initial_state,
           "initial dereferencing of the app should return the initial state");
        se(view_mock, "", "make sure the view is empty");
    });

    test("new_friend", function () {
        new_friend(test_app, "Sean");
        de(deref(test_app).friends, ["Kei", "Harry", "Simon", "Sean"], "A friend is added");
        se(view_mock, message({name: "David",
                               friends_count: "4",
                               friends: "Kei, Harry, Simon, Sean",
                               lost_friends: ""}),
          "View has changed in responce to the app");
    });

    test("bye_friend", function () {
        bye_friend(test_app, "Simon");
        de(deref(test_app).friends, ["Kei", "Harry", "Sean"], "A friend is gone");
        se(view_mock, message({name: "David",
                               friends_count: "3",
                               friends: "Kei, Harry, Sean",
                               lost_friends: "Simon"}),
          "View reflects the change");
    });
}());
