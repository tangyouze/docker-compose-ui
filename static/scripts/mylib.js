var LOG_FETCH_LINES = 3000;
var LOG_FETCH_LINES_REPEAT = 50;
var LOG_FETCH_INTERVAL = 1000;

String.prototype.hashCode = function () {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


var logMerge = function (orig, coming) {
  var dct = {};
  var res = [];
  orig.forEach(function (item) {
    dct[item.hashCode()] = true;
    res.push(item);
  });
  coming.forEach(function (item) {
    if (!dct.hasOwnProperty(item.hashCode())) {
      res.push(item);
    }
  });
  return res;
};

if (typeof module !== 'undefined' && module.exports != null) {
  exports.logMerge = logMerge;
}
