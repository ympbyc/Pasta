Pasta
=====

**App as a Value**

2012 Minori Yamashita <ympbyc@gmail.com>

Dependencies
------------

Underscore, Underscore-fix


Usage
-----

```javascript
with (Pasta)
(function () {
  //...
}());
```

API
---

### app

Creates an instance of Pasta application.

```javascript
var sample_app = app({friends: ["Tony", "Sam"]});
//=> an app
```

### deftransition

Defines a function F that receive an app and arbitrary number of arguments.
`Deftransition` takes a function G which gets invoked with current state and the argument passed to F, when the function defined by deftransition gets called. The function G must return a hashmap of changes to the state.

```javascript
/* adds a friend */
var new_friend = deftransition(function (state, name) {
    return { friends: _.conj(state.friends, name) };
});
//=> a function

/* removes a friend */
var bye_friend = deftransition(function (state, name) {
    return { friends: _.reject(state.friends, _.eq(name)) };
});
//=> a function
```

### watch_transition

Define a sideeffectful operation to happen whenever the field in the state changes,

```javascript
watch_transition(sample_app, function (new_state, old_state) {
    $(".friends").text(new_state.friends.join(","));
    $(".lost_friends").text(_.difference(old_s.friends, new_s.friends).join(","));
});
```

DOCS
----

***OUTDATED**

[See Documentation](http://ympbyc.github.io/Pasta/web/#mvc)


Pasta
-----

### models time correctly ###

Pasta's state management model is heavily influenced by that of [Clojure's](http://clojure.org/state). There is no data mutated throughout the execution.

### is capable of handling meta-applications ###

Pasta is a great tool to avoid pieces of uncontrolled states scattered all over your app.
If your app is made up of hundreds of mutable objects, it is rather cumbersome to gather them all and inspect or save the state of the app while it is running.
Meanwhile, Pasta forces every changeable data to be put into one big hashmap, allowing us to inspect, save, load, metaprogram the app.

### is platform independent ###

Pasta does not assume a particular platform where it is used. You can use Pasta in any JavaScript environment with any GUI APIs.

### is not object oriented ###

This is very important. Pasta does not mix data and behaviours. models and views are collections only of functions,
and the state is a collection only of data. With Pasta, it is highly possible to create apps that do not contain a single `this` keyword.

You could of course use your favourite data structure to put into the state or use OO libraries for UI manipulations, but it is not the concern of Pasta.


Tips
----

The state of a Pasta app can be persisted into localstorage, remote server or anywhere you can think of. Just serialize it into JSON and save.

Here goes a crazy tip: you can save the state into the state itself! If you know what I mean...

```javascript
...
```

![Back to the future](https://raw.github.com/ympbyc/Pasta/master/assets/img/backtothefuture.jpg)


Conceptually Close Projects
---------------------------

+ [Worlds](http://www.vpri.org/pdf/tr2011001_final_worlds.pdf) by Viewpoint Research Institute
+ [WebFUI](https://github.com/drcode/webfui)


Misc
----

Pasta is licensed under MIT licence



Change Log
----------

### 2013/10/9

Highly Destructive Change. Everything except the concept has changed.

### 2013/5/22

Pasta() now returns the signal function instead of an object.
