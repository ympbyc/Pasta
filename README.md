Pasta
=====

**Meta Application Function**

2012 Minori Yamashita <ympbyc@gmail.com>

> Pasta is a function that helps you write JavaScript MVC applications functionally.

Dependencies
------------

Underscore, Underscore-fix


API
---

### Pasta/4

Pasta takes all it needs to setup an application for you and returns an instance of pasta.

```javascript
Pasta(Model, UI, View, initialData); //=> a Pasta
```

### signal/1, signal/2

`Pasta()` produces a function named `signal`. `signal()` produces a function that will call a function in your model.

```javascript
$("button").click(pasta.signal("some_function_name", function (ev) {
  return "data";
}));
```

DOCS
----

[http://ympbyc.github.io/Pasta/web/#mvc](See Documentation)

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
var Model = _.module(
  {},

  function save_history (state) {
    return {previousState: state};
  },

  function back-to-the-future (state) {
    //go back 2 steps
    return state.previousState.previousState;
  }
);
```

![Back to the future](https://raw.github.com/ympbyc/Pasta/master/assets/img/backtothefuture.jpg)


Misc
----

Pasta is licensed under MIT licence



Change Log
----------

### 2013/5/22

Pasta() now returns the signal function instead of an object.
