Actors in JavaScript
====================

Actors can
+ receive messages
+ make local decisions
+ create more actors
+ send messages
+ determine how to respond to the next message received

*-- from wikipedia*

Asynchronous Functions
----------------------

Functions (especially asynchronous ones) are actors that respond to a single message pattern:

```javascript
aFunction .call (anObject, optionalArg, ...)
```

and they have a syntactic suger:

```javascript
aFunction (optionalArg, ...)
```

An example function actor is defined as follows:

```javascript
var squareActor = function (kont, n) {
  kont (n * n);
};
```

`kont` is another actor who receives the result of the computation.

Hash of asynchronous functions
------------------------------

Actors that have more than one entry-point can be expressed using the hash literal.
This hash contains **ONLY** functions. DO NOT STORE DATA IN IT.

An actor that respond to three messages `hello`, `how_are_you` and `bye` is defined as follows:

```javascript
var anActor = {
  "hello": function () {
    console .log ("Good day, mate!");
  }
, "how_are_you": function (theFriend) {
    theFriend ("Goooood");                 //here, your friend is a function actor
  }
, "bye": function (theFriend) {
    theFriend .see_you ("tomorrow");        //here, your friend is a hash actor
  }
};

//messaging
anActor .hello ()

var friend1 = function (result) {
  if (result === "No good") ambulance .call ()
}
anActor .how_are_you (friend1)

var friend2 = {
  see_you: function (when) { console .log ("OK. See you " + when)  }
}
anActor .bye (friend2)
```


Higher order actors
-------------------

Higher order actors take other actors and produce an actor. For example, UNIX pipe combines two actors to produce an actor (and can be chained).

Higher order actors are especially useful when you have to deal with mutable states, or force some actors to communicate in a certain specified way (e.g. Pasta).
