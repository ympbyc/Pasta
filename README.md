Pasta
=====

**Actor-based MVC Framework**

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

Pasta is an extremely lightweight (71 lines - uncompressed) Actor-based application framework for JavaScript. Pasta is designed to work best with non-browser platforms such as Titanium mobile but can easily be adapted for browsers, too.

If you are not familiar with the term **actor**, I suggest you read [ympbyc/Pasta/docs/actorsInJs.md](https://github.com/ympbyc/Pasta/blob/master/docs/actorsInJs.md).

**This README is hugely outdated**

Features
--------

### The State ###

Every application built with Pasta has a single model that holds all the sub-models that are passed around between actors as a READONLY object. We call it **the state**.
Pasta programs are referencially transparent about **the state**, meaning it is guaranteed the state maps one-to-one to the view.
Allowing apps to hibernate and respring.

### The Actors ###

Unlike other frameworks, Pasta source does not contain classes.
Instead they are made up of actors: an **appActor**, an **viewUpdateActor** and several **UI actors**. Each actor contains many smaller actors inside it.
`Pasta` function takes these three kinds of actors and connects them to form one application.

Each of the actors named above are given access to only a limited range of objects, making it impossible to breach the Presentation-Domain-Separation concept.

### Functional ###

Pasta is an attempt to do GUI programming in a functional way, yet easy enough to learn.

Pasta works best with underscore.js and underscore-fix.js.

How it works
------------

![How Pasta works](https://raw.github.com/ympbyc/Pasta/master/assets/img/diagram.png)

NOTE: some names in the diagram are old. `appModel` is now called `appActor`, `viewUpdateRule` is now called `viewUpdateActor`.

Example
-------

First, we create the `appActor` that maps signals to patches.
Functions in the actor can receive three arguments. `state`: a hash representing the current state of the app and `data`: any object that was passed with the signal, and `signal`.

```javascript
var appActor = {
  'start': function () {
    //initial state
    return {
      page:'top'
    , notes:[]
    };
  }
, 'add-note': function (state, memo) {
    return {
      notes: state.notes.concat({memo: memo})
    };
  }
, 'fetch-notes-from-server': function (state, _, signal) {
    //async operations
    httpRequest({
      url: '...'
    , type: 'GET'
    , success: function (j) {
        signal("fetch-complete")(j);
    }});
    return {};
  }
, 'fetch-complete': function (_, data) {
    return {notes: data}
  }
, 'switch-page-to-top': function () {
    return {
      page: 'topPage'
    };
  }
  //......
};
```

Next we create the `viewUpdateActor`.
 `viewUpdateActor` maps the change in state to UIs.

```javascript
var viewUpdateActor = {
  //UI is a hash of UI actors, state is the next state//
  notes: function (UI, state) {
    UI.notesPage.updateNoteList(state.notes);
  }
, page:  function (UI, state, oldVal) {
    //hide current page and show the new page
    switch (oldVal) {
      case 'topPage': UI.topView.hide(); break;
      case 'notesPage': UI.notesPage.hide(); break;
    }
    switch (state.page) {
      case 'topPage': UI.topView.show(); break;
      case 'notesPage': UI.notesPage.show(); break;
    }
  }
//.......
};
```

Finally, we kick things off in app.js

```javascript
var Pasta = require('Pasta');
var __ = Pasta.__;

(function () {

  var win = X.X.createWindow(); //the `parent` object passed to each UI's `initialize`

  Pasta(
    require('appActor')                  //appActor
  , {                                    //UI actors
     notesPage: require('./notesPage')
     topPage: ...
    }
  , require('viewUpdateActor')           //viewUpdateActor
  , win                                  //parent
  ).start();

  win.open();

}());
```

Pasta is
--------

### a jail ###

MVC, from its origin (Smalltalk), is deeply associated with object-oriented programming.
Typical MVC framework provides base classes Model, View and Controller for us to inherit.
This approach however, gives too much freedom to us and often we end up violating the PDS concept.
Pasta avoids this problem by putting us inside a cage where we are given access to only a limited range of information and objects that Pasta chooses.
For example: `appActor` is a hash of functions, not a class, forbidding to have a local state to share among other functions thus functions in the hash can only use what Pasta gives to it as arguments.

Here are some more restlictions:
+ No actor can directly mutate the `appState`,
+ `appActor` and `viewUpdateActor`, UI actors and `appActor` can not message eachother directly, it has to be done through `signal` and by returning a patch from appActors respectively.

### capable of handling meta-applications ###

Pasta is a great tool to avoid pieces of states scattered all over your app.
If your app is made up of hundreds of mutable objects, it is rather cumbersome to gather them all and inspect or save the state of the app while it is running.
Meanwhile, Pasta forces every changeable data to be put into **the state**, allowing us to inspect, save, load, metaprogram the app.

### platform independent ###

Pasta does not assume a particular platform where it is used. You can use Pasta in any JavaScript environment with any GUI APIs.

Pasta is not
------------

### object oriented ###

This is very important. Pasta does not mix data and behaviours. `appActor` and `viewUpdateActor` are collections only of functions,
and **the state** is a collection only of data. With Pasta, it is highly possible to create apps that do not contain a single `this` keyword.

You could of course use your favourite data structure to put into the state or use OO libraries for UI manipulations, but it is not the concern of Pasta.


Tips
----

**The state** can be persisted into localstorage, remote server or anywhere you can think of. Just serialize it into JSON and save.

Here goes a crazy tip: you can persist **the state** into **the state** itself! If you know what I mean...

```javascript
var appActor = {
  'saveHistory': function (state) {
    return {previousState: state};
  }
, 'back-to-the-future': function (state) {
    //go back 2 steps
    return state.previousState.previousState;
  }
};
```

![Back to the future](https://raw.github.com/ympbyc/Pasta/master/assets/img/backtothefuture.jpg)


Licence and stuff
-----------------

Pasta is licenced under MIT licence

Use it on your own responsibility.
