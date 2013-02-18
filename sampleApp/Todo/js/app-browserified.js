(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/Pasta.js",function(require,module,exports,__dirname,__filename,process,global){/*
 * Pasta.js
 *
 * Actor-based MVC framework
 *
 * 2013 Minori Yamashita <ympbyc@gmail.com>
 */

var Pasta = (function () {
  var __ = require('./Fw');

  //Hide informations that are not necessary for appRule actor, but for execution
  var mainloopGenerator = function (config) {
    return function (api, state, ev, ev_val) {
      var kont = function (patch) { api.modifyState(patch); };
      config[ev](kont, state, ev_val);
    };
  };


  var UIHandler = function (appModel, UIAPI, updateRule, parentUI) {
    var self = {};       //interface to the external world
    var appState = {};   //mutable application state
    var mainloop = mainloopGenerator(appModel);

    //`signal` function is given to UI actors on construction time, UI actors send messages to appRule actors
    // through this function.
    //`signal` have to be defined here because it accesses the closed mutable value `appState`
    var signal = function (ev_name, fn) {
      return function (e) {
        var val = fn ? fn(e) : e;
        mainloop(self, appState, ev_name, val);
      };
    };

    //Send messages to View actor.
    //Each message has a pattern `.changedVal (hash_of_UI_actors, copy_of_patched_appState, old_value)`
    function autoUpdate (patch) {
      var tempState = __.merge(appState, patch);
      __.hashFold(patch, null, function (change, key) {
        if (updateRule[key] !== undefined) updateRule[key](UIAPI, tempState, appState[key]);
      });
    }

    //initialize each view actors
    //app.js should send this
    self.start = function () {
      __.hashFold(UIAPI, null, function (mdl, key) {
        if (UIAPI[key].initialize) UIAPI[key].initialize(parentUI, signal);
      });
      signal('start')();
    };

    //call `autoUpdate`. When done, merge the patch to the current appState
    self.modifyState = function (patch) {
      autoUpdate(patch);       //apply changes to UIs
      __._merge(appState, patch); //destructively update appState
    };

    return self;
  };

  //Pasta() is UIHandler

  UIHandler.__ = __;
  return UIHandler;

}());

module.exports = Pasta;

});

require.define("/Fw.js",function(require,module,exports,__dirname,__filename,process,global){/*
 * Fw.js
 * 
 * 2013 Minori Yamashita <ympbyc@gmail.com>
 *
 * Fw.js is part of Pasta
 */

var Fw = (function () {
  var __ = {};

  //hashFold : {a:b} * c * (b * a * c -> c) -> c
  __.hashFold = function (hash, init, fn) {
    var key, last;
    last = init;
    for (key in hash)
      if ({}.hasOwnProperty.call(hash, key))
        last = fn(hash[key], key, last); //destructive binding
    return last;
  };

  //fold : (a * b -> b) -> [a] -> b
  __.fold = function (fn, init) {
    return function (ls) {
      var last = init;
      ls.forEach(function (it) {
        last = fn(it, last);
      });
      return last;
    };
  };
  //map : (a -> b) -> [a] -> [b]
  __.map = function (fn) {
    return __.fold(function (it, last) {
      return last.concat(fn(it));
    }, []);
  };
  //filter : (a -> Bool) -> [a] -> [a]
  __.filter = function (fn) {
    return __.fold(function (it, last) {
      if (fn(it)) return last.concat(it);
      return last;
    }, []);
  };
  //remove : a -> [a] -> [a]
  __.remove = function (item) {
    return __.filter(function (it) { return it !== item; });
  };

  //member : a -> [a] -> Bool
  __.member = function (item) {
    return function (arr) {
      return arr.indexOf(item) > -1;
    };
  };

  //destructive merge
  __._merge = function (dst, src) {
    __.hashFold(src, dst, function (it, key, last) {
      last[key] = it;
      return last;
    });
  };

  //merge :: {} -> {} -> {}
  __.merge = function (dst, src) {
    var copy = {};
    __._merge(copy, dst);
    __._merge(copy, src);
    return copy;
  };

  //template :: "" -> {"":""} -> ""
  __.template = function (tmpl, filler) {
    return __.hashFold(filler, tmpl, function (val, key, tmpl) {
      return tmpl.replace(new RegExp("{{"+key+"}}", "g"), val);
    });
  };

  return __;
}());

module.exports = Fw;

});

require.define("/sampleApp/Todo/js/appModel.js",function(require,module,exports,__dirname,__filename,process,global){//model constructor
function TodoItem (memo, id, checked) {
  return {id: id, memo: memo, checked: checked};
};

var appModel = {
  'start': function (send) {
    send({
      todos: []
    , curId: 0
    , route: location.hash
    , filter: function (_) { return true; }
    });
  }

, 'todo-add': function (send, state, memo) {
    var id = state.curId+1;
    send({curId:id, todos: state.todos.concat(TodoItem(memo, id, false))});
  }

, 'todo-remove': function (send, state, id) {
    send({todos: __.filter(function (it) { return it.id !== id; })(state.todos)});
  }

, 'todo-stat-change': function (send, state, item) {
    send({
      todos: __.map(function (it) {
        if (it.id !== item.id) return it;
        it.checked = item.checked;
        return it;
      })(state.todos)
    });
  }

, 'to-active': function (send, state) {
    if (state.route === '#/active') return;
    send({
      filter: function (x) { return ! x.checked;  }
    , route: '#/active'
    });
  }

, 'to-completed': function (send, state) {
    if (state.route === '#/completed') return;
    send({
      filter: function (x) { return x.checked; }
    , route: '#/completed'
    });
  }

, 'to-all': function (send, state) {
    if (state.route === '#/') return;
    send({
      filter: function () { return true; }
    , route: '#/'
    });
  }

};

module.exports = appModel;

});

require.define("/sampleApp/Todo/js/ui/todoList.js",function(require,module,exports,__dirname,__filename,process,global){var todoTemplate = '<li class="{{completed}}">\
  <div class="view">\
    <input class="toggle" type="checkbox" data-id="{{id}}" {{checked_}} >\
    <label>{{memo}}</label>\
    <button class="destroy" data-id="{{id}}"></button>\
  </div>\
  <input class="edit" value="{{memo}}">\
</li>';


exports.initialize = function (_, signal) {
  var $newTodo = $('#new-todo');
  $newTodo.on('keypress', function (e) {
    if (e.keyCode === 13)  {
      signal('todo-add')($newTodo.val());
      $newTodo.val('');
    }
  });

  $('#todo-list').on('refresh', function () {
    $('.destroy').click(signal('todo-remove', function (e) {return parseInt($(e.target).attr('data-id')); }));
    $('.toggle').click(signal('todo-stat-change', function (e) {
      var t = $(e.target);
      return {id: parseInt(t.attr('data-id')), checked: ! t.attr('checked')};
    }));
  });
};

exports.renderCounter = function (n) {
  $('#todo-count strong').text(n);
};

exports.renderTodos = function (todos) {
  $('#todo-list').html(__.fold(function (todo, str) {
    var item = __.merge(todo, {
      checked_: todo.checked ? 'checked' : ''
      , completed:todo.checked ? 'completed' : ''
    });
    return str + __.template(todoTemplate, item);
  }, "")(todos));
  $('#todo-list').trigger('refresh');
};

var r = {'#/':0,'#/active':1,'#/completed':2};

exports.selectLink = function (route, old) {
  $($('.route-link')[r[old]]).removeClass('selected');
  $($('.route-link')[r[route]]).addClass('selected');
};

});

require.define("/sampleApp/Todo/js/ui/cron.js",function(require,module,exports,__dirname,__filename,process,global){exports.initialize = function (_, signal) {
  setInterval(function () {
    var sig = {'#/':'to-all', '#/active':'to-active', '#/completed':'to-completed'}[location.hash];
    signal(sig)();
  }, 1000);
};

});

require.define("/sampleApp/Todo/js/viewUpdateRule.js",function(require,module,exports,__dirname,__filename,process,global){var updateRule = {
  id: function (UI, state) {
  }
, todos: function (UI, state) {
    UI.todoList.renderTodos(state.todos);
    UI.todoList.renderCounter(state.todos.length);
  }
, filter: function (UI, state) {
    UI.todoList.renderTodos(state.todos.filter(state.filter));
  }
, route: function (UI, state, old) {
    UI.todoList.selectLink(state.route, old);
  }
};

module.exports = updateRule;

});

require.define("/sampleApp/Todo/js/app.js",function(require,module,exports,__dirname,__filename,process,global){window.Pasta = require('../../Pasta');
window.__ = Pasta.__;

$(function () {

  Pasta(
    require('./appModel')
  , {
      todoList: require('./ui/todoList')
    , cron: require('./ui/cron')
    }
  , require('./viewUpdateRule')
  , $('#todo-content')
  ).start();

});

});
require("/sampleApp/Todo/js/app.js");
})();
