var Security = require("nativescript-security").Security;
var security = new Security();

// TODO replace 'functionname' with an acual function name of your plugin class and run with 'npm test <platform>'
describe("functionname", function() {
  it("exists", function() {
    expect(security.functionname).toBeDefined();
  });

  it("returns a promise", function() {
    expect(security.functionname()).toEqual(jasmine.any(Promise));
  });
});