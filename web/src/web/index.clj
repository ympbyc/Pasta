(ns web.index
  (require [hiccup.core :as h]
           [hiccup.util :as hu])
  (:gen-class))

(def code-smallest-html (hu/escape-html "
<!doctype html>
<html>
<head>
    <mata charset=\"utf-8\">
    <script src=\"components/underscore/underscore.js\"></script>
    <script src=\"components/underscore-fix/underscore-fix.js\"></script>
    <script src=\"components/Pasta/Pasta.js\"></script>
    <script src=\"components/jquery/jquery.min.js\"></script>
</head>
<body>
    <h1 class=\"message\"></h1>
    <input type=\"text\" id=\"message-input\" />
    <button id=\"message-submit\">Change message</button>
</body>
"))

(def code-smallest-js "(function (window) {
    'use strict';

    /* Model is a collection of functions that are responsible for every data used in an app.
     * Each function takes the current state and returns a diff.
     */
    var Model = {
        change_message: function (state, msg) {
            return { message: 'You said ' + msg + '.'};
        }
    };

    /* View react to changes made to the state and redirects it to the UI */
    var View = {
        message: function (UI, state) {
            UI.render_message(state.message);
        }
    };

    /* UI touches the DOM */
    var UI = {
        render_message: function (msg) {
            $('.message').text(msg);
        }
    };

    /* Pasta the function composes everything and turn them into an application. */
    /* The function returns a function that is used to communicate with the app. */
    var pasta_signal = Pasta(Model, UI, View);

    /* Controllers use the signal function */
    $('#message-submit').click(pasta_signal('change_message', function (e) {
        return $('#message-input').val();
    }));
} (window));")

(def demo-smallest
  [:div#demo-smallest.demo
   [:strong.message "I said hello."]
   [:input#message-input {:type "text"}]
   [:button#message-submit.btn.btn-blue "Change message"]
   [:script code-smallest-js]])

(def code-model-js "
var Model = _.module({}, add_todo, toggle_status, clear_completed, save_app, load_app);

//Add a new todo entry
function add_todo (state, title) {
    //check that it's not empty before creating a new todo.
    var trimmed_title = title.trim();
    if (_.isEmpty(trimmed_title)) return {};
    return { todos: state.todos.concat({title: title, completed: false}) };
}


//Mark a todo either active or complete
function toggle_status (state, data) {
    return { todos: _.map(state.todos, function (todo) {
        if (todo === data.todo) return _.assoc(todo, 'completed', data.completed);
        return todo;
    }) };
}


//Clear completed todos
function clear_completed (state) {
    return { todos: _.reject(state.todos, _.flippar(_.at, 'completed')) };
}


//Save the entire app to localStorage
function save_app (state) {
    localStorage.setItem('pasta-todo', JSON.stringify(state));
    return {};
}


//Recover the app from localStorage
function load_app (state) {
    return localStorage.getItem('pasta-todo')
        || { todos: [] };
}
")

(def code-view-server-js "
var Model = (function () {

    return _.module({}, change_track, track_ready, sound_ready);

    function change_track (st, url) {
        return { track_url: url };
    }


    function track_ready (st, track) {
        return { track: track };
    }


    function sound_ready (st, sound) {
        return { sound: sound };
    }
}());

var View = (function () {

    return _.module({}, track_url, track, sound);


    function track_url (UI, st) {
        SC.get('/resolve', { url: st.track_url }, pasta_signal('track_ready'));
    }


    function track (UI, st) {
        SC.stream('/tracks/' + st.track.id, pasta_signal('sound_ready'));
    }


    function sound (UI, st) {
        st.sound.play();
    }
}());
")

(def code-model-server-js "
/* Note this isn't a recommended SoundCloud API usage. */
var Model = (function () {

    return _.module({},  get_track);

    function get_track (st, url) {
        return { track: $.get('http://api.soundcloud.com/resolve?url=https://soundcloud.com/forss/voca-nomen-tuum&client_id=XXXXXXXXX&format=json&_status_code_map[302]=200') };
    }
}());

var View = (function () {

    return _.module({}, track);

    function track (UI, st) {
        st.track.then(function (j) { /* ... */ });
    }
}());
")

(def code-view-js "
var View = _.module({}, todos);

function todos (UI, state) {
    UI.render_todos(state.todos);
}
")

(def code-ui-js "
var UI = _.module({}, render_todos);

function render_todos (todos) {
    $('#todos').html(_.template(TODOS_TEMPLATE, todos));
}
")

(def code-controller-js "
$('#new-todo').keyup(function (e) {
    if (e.which === ENTER_KEY) {
        signal('add_todo')($(this).val());
    }
});


$('#clear-completed').click(signal('clear_completed'));
")

(def menu
  [:div#menu
   [:a.btn.btn-blue.page {:href "#content"} "Top"]
   [:a.btn.btn-blue.page {:href "#downloads"} "Downloads"]
   [:a.btn.btn-blue.page {:href "#smallest-example"} "Example"]
   [:a.btn.btn-blue.page {:href "#mvc"} "MVC"]
   [:a.btn.btn-blue.page {:href "#diagram"} "Diagram"]])

(defn html-head []
  [:head
   [:meta {:charset "utf-8"}]
   [:title "Pasta"]
   [:link {:rel  "stylesheet"
           :href "components/kraken/kraken.css"}]
   [:link {:rel "stylesheet"
           :href "components/google-code-prettify/prettify.css"}]
   [:link {:rel  "stylesheet"
           :href "css/style.css"}]
   [:script {:src "components/jquery/jquery.min.js"}]
   [:script {:src "components/google-code-prettify/prettify.js"}]
   [:script {:src "components/underscore/underscore-min.js"}]
   [:script {:src "components/underscore-fix/underscore-fix.js"}]
   [:script {:src "components/Pasta/Pasta.js"}]])

(defn html-body []
  [:body {:onload "prettyPrint()"}
   [:header
    [:h1 "Pasta"]
    [:i "Meta Application"]
    menu]
   [:div#content
    [:div
     [:img.center {:src "images/logo.svg"}]]
    [:section
     [:p "Pasta is a function that helps you write JavaScript MVC applications functionally. Pasta's state management model is heavily influenced by that of " [:a {:href "http://clojure.org/state"} "Clojure's"] "."]
     [:p "The project is " [:a {:href "https://github.com/ympbyc/Pasta"} "hosted on GitHub"] ". Eaxample application is available " [:a {:href "http://ympbyc.github.io/Pasta/examples/todo-pasta/"} "here"] "."]]
    [:section#downloads
     [:h2 "Downloads and Dependencies"]
     [:div
      [:a.btn.btn-blue {:href "https://raw.github.com/ympbyc/Pasta/master/Pasta.js"} "Pasta.js (master)"] [:em " 2kb uncompressed"]
      [:p "Pasta depends on " [:a {:href "http://underscorejs.org/"} "Underscore"] " (or lodash if you prefer), and " [:a {:href "https://github.com/ympbyc/underscore-fix"} "Underscore-fix"] ". " [:a {:href "http://jquery.com/"} "jQuery"] " is optional."]]]
    [:section#not-your-daddy
     [:h2 "Not Your Daddy's MVC Framework"]
     [:p "In fact, Pasta isn't even a framework, nor a library but a single 35 line function. If you are familier with FP(Functional Programming), Pasta is a higher order function much like " [:span.code "fold"] " and " [:span.code "compose"] " . Just like " [:span.code "fold"] " abstracting the essence of recursion, Pasta abstracts the essence of entire JavaScript application. Just like " [:span.code "compose"] " taking functions to create a function, Patsa takes collections of functions to create an application. If frameworks are tools or guidelines to construct a building, " [:span.important "Pasta is a machine that builds the entire building according to the blueprint you feed it."]]]
    [:hr]
    [:section#smallest-example
     [:h2 "Smallest Example"]
     [:p "Let me show you a tiny example. Just note it's a bit overkill to use Pasta for an app of this size."]
     [:pre.prettyprint
      code-smallest-html]
     [:pre#code-smallest.prettyprint
      code-smallest-js]
     [:p "Here goes the live demo."]
     demo-smallest]
    [:hr]
    [:section
     [:h2 "Pasta Is Simple"]
     [:p [:strong "Simple"] " in the sense Rich Hickey told us in his talk " [:a {:href "http://www.infoq.com/presentations/Simple-Made-Easy"} "Simple Made Easy"] ". Pasta lets you treat " [:span.important "data as data"] " and it turns " [:span.important "uncontrolled global state into a concrete first-class value"] ". Pasta is mostly functional. The model is a collection of pure functions. The application itself is a pure function that maps an application state to an UI state."]
     [:p "Pasta is simple because Pasta apps are not object oriented. Objects should be avoided where possible because they introduce implicit global state, makes it hard to inspect data (you know, \"" [:i "information hiding"] "\") and makes it so easy to corrupt data."]
     [:p "Pasta is simple because it doesn't do anything that it isn't supporsed to do. There are good data manipulation libraries already, namely Underscore. There are good UI manipulation libraries already, namely jQuery. No point reinventing the wheel is there?"]]
    [:hr]
    [:section#mvc
     [:h2 "MVC the Pasta way"]
     "With all that in mind, lets see how Pasta effectively forces presentation domain separation, by looking at the classic TodoMVC example. The full source is available " [:a {:href "https://github.com/ympbyc/Pasta/tree/master/examples/todo-pasta"} "here"] "."
     [:section
      [:h3 "Model"]
      [:pre.prettyprint code-model-js]
      [:p "The Model is a hashmap mapping signal names to binary functions. " [:span.code "_.module()"] " provides a nice way to write hashmap-of-functions prettily. Each function receives the current state as its first argument. The second is whatever is passed in via a signal which we will come to later. The state is just a plain hashmap which you mustn't mutate yourself. The role of each function is to return a patch. Patches are, again, just a plain hashmap."]
      [:p "Since it is advised to prefer primitive types over user-defined objects, we can do some crazy stuff like serializing it into JSON and save somewhere and recover it later. Because the state passed is a immutable value, we can store it into the state itself, meaning implementing a full `undo` functionality is a piece of cake."]
      [:p "When you need to communicate with a server, it is recommended to place ajax calls in the view. So for example if you are trying to get a sound object from SoundCloud API you would do something like this:"]
      [:pre.prettyprint code-view-server-js]
      [:p "Alternatively, you could use promises as state values  but I find it makes the rest of the code a bit awkward having to read them using " [:span.code ".then"] " everywhere."]
      [:pre.prettyprint code-model-server-js]]
     [:section
      [:h3 "View"]
      [:pre.prettyprint code-view-js]
      [:p "The view is a hashmap mapping field names of the state to ternary functions. Each function gets called whenever the field the function is responsible for changes. The first argument is the UI module which we will see next. The second is the new state after the change. The last argument is the value of the field before the change. The role of each function is to call functions (uh, ahem, subroutines) in the UI module. Although the functions receive the state, mutating it is no use since it is a fresh copy. Don't try."]]
     [:section
      [:h3 "UI"]
      [:pre.prettyprint code-ui-js]
      [:p "No description is needed for the UI module because it isn't really a part of Pasta. Pasta does not care how you manage the UI. this makes Pasta portable accross different platforms. In fact Pasta initialy targeted Titanium Mobile as a platform and it probably still runs."]]
     [:section
      [:h3 "Generation of An App"]
      [:pre.prettyprint "var pasta_signal = Pasta(Model, UI, View);"]
      [:p "Throw all of the above three modules at " [:span.code "Pasta"] " to generate the app. " [:span.code "Pasta"] " leaves a function behind which is the only connection we have to the running app. We will make heavy use of this function in our controllers."]]
     [:section
      [:h3 "Controller"]
      [:pre.prettyprint code-controller-js]
      [:p "Controllers are not grouped into a module because there's no need to. Controllers can be anything that " [:span.code "signal"] "s. A signal invokes a model function and whatever you feed to " [:span.code "signal"] " becomes the second argument to the function."]]]
    [:hr]
    [:section#diagram
     [:h2 "A Diagram"]
     [:p "Here is a conceptual diagram of Pasta applications."]
     [:img {:src "images/pasta_diagram.svg"}]
     [:p "Which looks a lot like the diagram of Clojure's time model from " [:a {:href "http://www.infoq.com/presentations/Are-We-There-Yet-Rich-Hickey"} "Are We There Yet."]]
     [:img {:src "images/arewethereyetTimeModel.png"}]]
    [:section
     [:h2 "Experimental Features"]
     [:p "A common syntactic pattern found in Pasta app is the duplication of identity name in a line. When you change the value of an identity, you need to do something like this: "]
     [:pre.prettyprint "function add_todo (st, title) {
    return { todos: _.conj(state.todos, {title: title, completed: false})};
}"]
     [:p "This is a bit annoying so I came up with this following syntax."]
     [:pre.prettyprint "function add_todo (st, title) {
    return { todos: [_.conj, {title: title, completed: false}] };
}"]
     [:p "If you think this is a good idea, you can enable it by passing " [:span.code "true"] " as the fifth argument to " [:span.code "Pasta"] ". I also recommend to check out " [:a {:href "http://ympbyc.github.io/Macaroni/web"} "Macaroni"] " in which it takes full advantage of this strange syntax."]]]
   [:script "
$('a.page').click(function (e) {
  e.preventDefault();
  $('html,body').animate({scrollTop: $($(this).attr('href')).offset().top - $('header').height()});
  return false;
});
"]])

(defn main-html []
  (h/html
   [:html
    (html-head)
    (html-body)]))
