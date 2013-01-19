var __ = Fw;

test("hashFold", function () {
  strictEqual(__.hashFold({a:1,b:2,c:3}, 0, function (it, key, last) {
    return it + last;
  }), 6, "addition");

  deepEqual(__.hashFold({a:1,b:2,c:3}, {}, function (it, key, last) {
    last[key] = it;
    return last;
  }), {a:1,b:2,c:3}, "copy");

  deepEqual(__.hashFold({a:1,b:2,c:3}, [], function (it, key, last) {
    return last.concat(key);
  }), ['a', 'b', 'c'], "key sequence");
});

test("fold", function () {
  strictEqual(__.fold(function (it, last) {
    return it + last;
  }, 0)([1,2,3]), 6, "addition");

  deepEqual(__.fold(function (it, last) {
    return last.concat(it);
  }, [])([1,2,3]), [1,2,3], "copy");

  deepEqual(__.fold(function (it, last) {
    return [it].concat(last);
  }, [])([1,2,3]), [3,2,1], "reverse");
});

test("map", function () {
  deepEqual(__.map(function (it) {
    return it * it;
  })([1,2,3]), [1,4,9], "square");
});

test("filter", function () {
  deepEqual(__.filter(function (it) {
    return it % 2 === 0;
  })([1,2,3,4,5,6,7,8,9,10]), [2,4,6,8,10], "even");

  deepEqual(__.filter(function (it) {
    return it > 3;
  })([1,2,3,4,5,6]), [4,5,6], "greater than");
});

test("remove", function () {
  deepEqual(__.remove(3)([1,2,3,4,5]), [1,2,4,5], "simple");
  deepEqual(__.remove({a:1})([{a:1},{a:2}]), [{a:1},{a:2}], "strict equal");
});

test("member", function () {
  strictEqual(__.member(3)([1,2,3,4,5]), true, "simple true");
  strictEqual(__.member(6)([1,2,3,4,5]), false, "simple false");
  strictEqual(__.member({a:1})([{a:1}]), false, "strict equal");
});

test("_merge", function () {
  var x = {a:1,b:2};
  __._merge(x, {c:3,d:4});
  deepEqual(x, {a:1,b:2,c:3,d:4}, "destructive merge");
});

test("merge", function () {
  deepEqual(__.merge({a:1,b:2}, {c:3,d:4}), {a:1,b:2,c:3,d:4}, "merge");
  var x = {a:1,b:2};
  __.merge(x, {c:3,d:4});
  deepEqual(x, {a:1,b:2}, "pure merge does not affect the original");
});

test("template", function () {
  strictEqual(__.template("<h1>{{name}}</h1><p>{{txt}}</p>", {name:"Foo", txt:"hello"}), "<h1>Foo</h1><p>hello</p>", "html");
});
