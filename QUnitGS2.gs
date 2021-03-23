// Optional for easier use.
var QUnit = QUnitGS2.QUnit;

// HTML get function
function doGet() {
   QUnitGS2.init();

   QUnit.test("simple numbers", function( assert ) {
    assert.equal(divideThenRound(10, 2), 5, "whole numbers");
    assert.equal(divideThenRound(10, 4), 3, "decimal numbers");
  });

  testFiatAccount();

   QUnit.start();
   return QUnitGS2.getHtml();
}

// Retrieve test results when ready.
function getResultsFromServer() {
   return QUnitGS2.getResultsFromServer();
}
