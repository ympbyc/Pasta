exports.initialize = function (_, signal) {
  setInterval(function () {
    var sig = {'#/':'to-all', '#/active':'to-active', '#/completed':'to-completed'}[location.hash];
    signal(sig)();
  }, 1000);
};
