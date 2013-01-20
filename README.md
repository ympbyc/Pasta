Pasta
=====

**Meta application framework**

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

Pasta is an extremely lightweight (53 lines - uncompressed) MVC-like framework for JavaScript. Pasta is designed to work best with non-browser platforms such as Titanium mobile but can easily be adapted for browsers, too.

Features
--------

### The State ###

Every application built with Pasta has a single model that holds all the sub-models that changes during execution. We call it **the state**.
Pasta programs are referencially transparent about **the state**, meaning it is guaranteed the state maps one-to-one to the view. 
Allowing apps to hibernate and respring.

### Configuration-oriented ###

Unlike other frameworks, Pasta programs does not contain classes. 
Instead, they consist of two **configuration hash** and several UI components.  
The first configuration hash is called the `appModel`. 
It maps `signals` to actors(functions) that produce patches to the current state of the app.  
The second config hash called `viewUpdateRule` is used to reflect the changes to UIs.

Functions in these hashes are given access to a carefuly chosen set of infomations and APIs 
to let users think **inside of the box** so the paradigm doesn't break.

### Functional ###

May be because of too much exposure to Scheme and SML, I happen to be no longer appreciating OOP as much as I did a while back.
Pasta is an attempt to do GUI programming in a functional way, yet easy enough to learn.

`Pasta.__` provides some basic enumerable functions that are convinient when working with collection type models. 
If `Pasta.__` does not suffice your needs, checkout underscore.js.

How it works
------------

![How Pasta works](https://raw.github.com/ympbyc/Pasta/master/assets/img/diagram.png)

Example
-------

First, we create the `appModel` that maps signals to patches.

```javascript
var appModel = {
  'start': function (send) {
    //initial state
    send({
      page:'top'
    , notes:[]
    });
  }
, 'add-note': function (send, state, memo) {
    send({
      notes: state.notes.concat({memo: memo})
    });
  }
, 'fetch-notes-from-server': function (send, state) {
    //send is a continuation-actor so we can perform async operations here
    httpRequest({
      url: '...'
    , type: 'GET'
    , success: function (j) {
        send({notes: j});
    }});
  }
, 'switch-page-to-top': function (send) {
    send({
      page: 'topPage'
    });
  }
  //......
};
```

Next we create the `viewUpdateRule`.
 `viewUpdateRule` is a mapping between state changes and actual UIs.

```javascript
var viewUpdateRule = {
  notes: function (UIAPI, state) {
    UIAPI.notesPage.updateNoteList(state.notes);
  }
, page:  function (UIAPI, state, oldVal) {
    //hide current page and show the new page
    switch (oldVal) {
      case 'topPage': UIAPI.topView.hide(); break;
      case 'notesPage': UIAPI.notesPage.hide(); break;
    }
    switch (state.page) {
      case 'topPage': UIAPI.topView.show(); break;
      case 'notesPage': UIAPI.notesPage.show(); break;
    }
  }
//.......
};
```

To show the models we need to create views. 
Pasta does not concern about how views(UIs) are created and manipulated, and it provides no support for UI manipulation. 
The only requirement is that user interactions are bound to the `signals`.

```javascript
//notesPage.js

//If `initialize` function is defined, it gets called with the pointer to parent element and the `signal` function
exports.initialize = function (parent, signal) {
  var mainView = add(parent, X.X.createView());
  var textField = add(mainView, X.X.createTextField());

  mainView.hide();

  //when text is entered, signal 'add-note'
  textField.addEventListener('return', signal('add-note', function (e) { return e.source.value; }));
};
exports.updateNoteList = function (notes) {
  notes.forEach(function (note) {
    add(mainView, X.X.createLabel({text: note.memo}));
  });
};
exports.show = ...
exports.hide = ...
```

Finally, we kick things off in app.js

```javascript
var Pasta = require('Pasta');
var __ = Pasta.__;

(function () {

  var win = X.X.createWindow()
  
  //Pasta.UIHandler is the source of magic
  Pasta.UIHandler(
    require('appModel')
  , {
     notesPage: require('./notesPage')
     topPage: ... 
    }
  , require('viewUpdateRule')
  , win
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
Pasta avoids this problem by putting us inside a cage where we are given access to only a limited range of information and APIs that Pasta chooses.
For example: `appModel` has to be a hash of functions, not a class, forbidding to have a local state to share among other functions thus functions in the hash can only use what Pasta gives to it as arguments.

### capable of handling meta-applications ###

Pasta is a great tool to avoid pieces of states scattered all over your app. 
If your app is made up of hundreds of mutable objects, it is rather cumbersome to gather them all and inspect or save the state of the app while it is running.  
Meanwhile, Pasta forces every changeable data to be put into **the state**, allowing us to inspect, save, load, metaprogram the app.

### platform independent ###

Pasta does not assume a particular platform where it is used. You can use Pasta in any JavaScript environment with any GUI APIs.

Pasta is not
------------

### object oriented ###

This is very important. Pasta does not mix data and behaviours. `appModel` and `viewUpdateRule` is collections only of functions, 
and **the state** is a collection only of data. With Pasta, it is highly possible to create apps that does not contain a single `this` keyword.

You could of course use your favourite data structure to put into the state, but it is not the concern of Pasta.

### concerned with how views are created  ###

Because Pasta is platform independent, it does not provide view generation mechanisms. You have to do it on your own using for example jQuery or Titanium.UI.

Tips
----

**The state** can be persisted into localstorage, remote server or anywhere you can think of. Just serialize it into JSON and save.

Here goes a crazy tip: you can persist **the state** into **the state** itself! If you know what I mean...

```javascript
var appModel = {
  'saveHistory': function (send, state) {
    send({previousState: __.merge({}, state)});
  }
, 'back-to-the-future': function (send, state) {
    //go back 2 steps
    send(state.previousState.previousState);
  }
};
```

![Back to the future](https://raw.github.com/ympbyc/Pasta/master/assets/img/backtothefuture.jpg)


Licence and stuff
-----------------

Pasta is licenced under MIT licence

Use it on your own responsibility.
