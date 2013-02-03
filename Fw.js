/*
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
