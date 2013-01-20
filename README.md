Pasta
=====

**Functional realization of the MVC pattern**

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

Pasta is an extremely lightweight (53 lines - uncompressed) GUI programming framework for JavaScript. Pasta is designed to work best with non-browser platforms such as Titanium mobile but can easily be adapted for browsers, too.

Features
--------

### The State ###

Every application built with Pasta has a single model that holds all the sub-models that changes during execution. We call it **the state**.
Pasta programs are referencially transparent about **the state**, meaning it is guaranteed the state maps one-to-one to the visual representation of UIs. 
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

![How Pasta works](https://raw.github.com/ympbyc/Pasta/master/diagram.png)

Example
-------

First, we create the `appModel` that maps signals to patches.

```javascript
var appModel = {
  'start': function (send) {
    send({page:'top', notes:[]}); //initial state
  }
, 'add-note': function (send, state, memo) {
    send({notes: state.notes.concat({memo: memo})});
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
    send({page: 'topPage'});
  }
//......
};
```

Next we create the `viewUpdateRule`.
 `viewUpdateRule` is a mapping between state changes and visual presentations.

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

Finally, we kick things up in app.js

```javascript
var Pasta = require('Pasta');
var __ = Pasta.__;

(function () {

  var appModel = require('appModel');  
  
  var viewUpdateModel = require('viewUpdateModel');

  //Pasta.UIHandler is the source of magic
  Pasta.UIHandler(
    appModel
  , {
     notesPage: require('./notesPage')
     topPage: ... 
    }
  , viewUpdateRule
  , X.X.createWindow()
  ).start();

}());
```

What Pasta is and what it is not
-----------------------------

//A lot of stuff should go in here


Licence and stuff
-----------------

Pasta is licenced under DOWHATEVERYOUWANTWITHIT licence

Use it on your own responsibility.
