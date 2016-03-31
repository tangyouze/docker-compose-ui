var assert = require('assert');
var mylib = require('../static/scripts/mylib.js');

describe('array', function () {
  it('should be good', function () {
    assert.equal(1, 1);
    var a = ["1", "3", "5"];
    var b = ["5", "9", "10"];

    var tt = mylib.logMerge(a, b);
    var target = ["1", '3', '5', '9', '10'];
    target.forEach(function (item, idx) {
      assert.equal(tt[idx], item);
    });
  });
});
