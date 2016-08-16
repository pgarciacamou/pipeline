module.exports = function uniqueID() {
  var obj = { __isUniqueID: true };
  return Object.freeze ? Object.freeze(obj) : obj;
};