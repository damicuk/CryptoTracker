/**
 * The method that does most of the work
 * Validates and processes the ledger, retrieves the currenct crypto prices, and writes the reports
 * Updates the data validation on the ledger currency and wallet columns
 * Displays alert in case of API error
 * Otherwise displays toast on success
 * Returns the currenct cell to its original location
 */
CryptoTracker.prototype.writeReports = function () {

  let currentCell = SpreadsheetApp.getCurrentCell();

  let ledgerProcessed = this.processLedger();

  if (!ledgerProcessed) {

    return;

  }

  let errorMessage = this.exRatesSheet();

  this.fiatAccountsSheet();
  this.openPositionsReport();
  this.closedPositionsReport();
  this.donationsReport();
  this.incomeReport();
  this.openSummaryReport();
  this.closedSummaryReport();
  this.incomeSummaryReport();
  this.donationsSummaryReport();
  this.cryptoWalletsReport();
  this.fiatWalletsReport();
  this.openPLReport();
  this.closedPLReport();
  this.exRatesTable();

  this.updateLedgerCurrencies();
  this.updateLedgerWallets();

  if (errorMessage) {
    this.handleError('api', errorMessage);
  }
  else {
    SpreadsheetApp.getActive().toast('Reports complete', 'Finished', 10);
  }

  SpreadsheetApp.setCurrentCell(currentCell);

}

/**
 * Deletes all the output sheets
 * Not intended for use by the end user
 * Useful in development and testing
 */
CryptoTracker.prototype.deleteReports = function () {

  let sheetNames = [
    this.openPositionsReportName,
    this.closedPositionsReportName,
    this.donationsReportName,
    this.incomeReportName,
    this.openSummaryReportName,
    this.closedSummaryReportName,
    this.incomeSummaryReportName,
    this.donationsSummaryReportName,
    this.cryptoWalletsReportName,
    this.fiatWalletsReportName,
    this.openPLReportName,
    this.closedPLReportName,
    this.exRatesTableSheetName,
    this.exRatesSheetName,
    this.fiatAccountsSheetName
  ];

  this.deleteSheets(sheetNames);

}