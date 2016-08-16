var uniqueID = require("../../../src/helpers/uniqueID.js");

describe('uniqueID helper', function() {
  it('should return a uniqueID', function() {
    expect(uniqueID().__isUniqueID).toBeTruthy();
  });
});