Pasta
=====

**Mostly Functional MVC Framework**

2012 Minori Yamashita <ympbyc@gmail.com>

```
 .----------------.  .----------------.  .----------------.  .----------------.  .----------------.
| .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
| |   ______     | || |      __      | || |    _______   | || |  _________   | || |      __      | |
| |  |_   __ \   | || |     /  \     | || |   /  ___  |  | || | |  _   _  |  | || |     /  \     | |
| |    | |__) |  | || |    / /\ \    | || |  |  (__ \_|  | || | |_/ | | \_|  | || |    / /\ \    | |
| |    |  ___/   | || |   / ____ \   | || |   '.___`-.   | || |     | |      | || |   / ____ \   | |
| |   _| |_      | || | _/ /    \ \_ | || |  |`\____) |  | || |    _| |_     | || | _/ /    \ \_ | |
| |  |_____|     | || ||____|  |____|| || |  |_______.'  | || |   |_____|    | || ||____|  |____|| |
| |              | || |              | || |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'  '----------------'  '----------------'
```

Pasta is an extremely lightweight (65 lines - uncompressed) function oriented MVC framework for JavaScript.

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

MVC
---

### State

Pasta manages one big plain hashtable to maintain its state. Pasta applications proceed by changing this hashtable and react to that change.

An example data would look something like this.

```javascript
var appData = {
  user:    {id:1234, name:'Sam'},
  friends: [{name:'Mike'}, {name:'Tom'}],
  notes:   [{id:12, text:'hello'}],
  editing: {text: 'i am typin'}
};
```

Because it is an ordinary JavaScript object, you can store it basically anywhere. Imagine sending the running application state to your server in JSON format and resume from there whenever you get back.

### Model

The model is one big hashtable of functions. Each function receives the state, whatever a data user has sent, and a reference to `Pasta#signal` function which we will come back to later.

The model is responsible for modifying the state although it is not allowed to directly touch it. Each function in the model returns a patch hashtable that will get merged to the state by Pasta.

```javascript
var Model = _.module(
  {},

  function edit_name (state, new_name) {
    return {user: _.assoc(state.user, 'name', new_name)};
  },

  function add_note (state, note, signal) {
    $.post('/notes', note, signal("note_added"), 'json');
    return {};
  },

  function note_added (state, result, signal) {
    return {notes: state.notes.concat(result)};
  }
);
```

More on the `signal` later.

Note: the code above doesn't run on IE. You could just use a plain hashtable instead of relying on `_.module` if you need to support IE.

### UI

The UI is one big hashtable of functions. The UI is not really a part of Pasta but it's there just for convenience. You can put UI manipulation helpers in this module.

```javascript
var UI = _.module(
  {},

  function change_name (name) {
    $(".user-name").text(name);
  },

  function render_notes_list (notes) {
    _.each(notes, function (n) {
      //...
    });
  }
);
```

### View

The view is one big hashtable of functions. Each function receives the UI module, the current state, and the old value of the field the function is responsible for. The role of the view is to reflect the changes made to the state to the actual UI.

```javascript
var View = _.module(
  {},

  //this gets called whenever the `user` field in the state changes
  function user (UI, state, oldVal) {
    if (state.user.name !== oldVal.name) {
      alert('Bye ' + oldVal.name '. Hello ' + state.user.name + '.');
      UI.change_name(state.user.name);
    }
  },

  //this gets called whenever the `notes` field in the state changes
  function notes (UI, state) {
    UI.render_notes_list(state.notes);
  }
);
```

### Application

When you have prepared your model, ui and the view, it's time to feed them all to Pasta. The function `Pasta` will wire the modules to generate your application. Pasta function produces a function named `signal` which you might want to bind to a variable for later use.


### Controller

A controller is whatever that calls `signal`. You tipically call this function when user interacts with the UI, such as clicking on a button or typing in his/her name to a text field. One signal invokes one of the functions defined in the model module.

```javascript
//invokes Model.edit_name
$("button").click(signal("edit_name", function (ev) {
  return "Dave";
}));
```


How it works
------------

![How Pasta works](https://raw.github.com/ympbyc/Pasta/master/assets/img/diagram.png)

Pasta is
--------

### capable of handling meta-applications ###

Pasta is a great tool to avoid pieces of states scattered all over your app.
If your app is made up of hundreds of mutable objects, it is rather cumbersome to gather them all and inspect or save the state of the app while it is running.
Meanwhile, Pasta forces every changeable data to be put into **the state**, allowing us to inspect, save, load, metaprogram the app.

### platform independent ###

Pasta does not assume a particular platform where it is used. You can use Pasta in any JavaScript environment with any GUI APIs.

Pasta is not
------------

### object oriented ###

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
