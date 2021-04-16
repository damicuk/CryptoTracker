/**
 * Validates and processes the ledger, retrieves the currenct crypto prices, and writes the reports.
 * Uses the error handler to handle any ValidatioError, CryptoAccountError, or ApiError .
 * Updates the data validation on the ledger currency and wallet columns.
 * Displays toast on success.
 * Returns the currenct cell to its original location.
 */
CryptoTracker.prototype.writeReports = function () {

  let currentCell = SpreadsheetApp.getCurrentCell();

  let ledgerRecords;
  try {
    ledgerRecords = this.getLedgerRecords();
    this.validateLedgerRecords(ledgerRecords);
  }
  catch (error) {
    if (error instanceof ValidationError) {
      this.handleError('validation', error.message, error.rowIndex, error.columnName);
      return;
    }
    else {
      throw error;
    }
  }

  try {
    this.processLedger(ledgerRecords);
  }
  catch (error) {
    if (error instanceof CryptoAccountError) {
      this.handleError('cryptoAccount', error.message, error.rowIndex, 'debitAmount');
      return;
    }
    else {
      throw error;
    }
  }

  let apiError;
  try {
    this.exRatesSheet();
  }
  catch (error) {
    if (error instanceof ApiError) {
      //handle the error later
      apiError = error;
    }
    else {
      throw error;
    }
  }

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
  this.exRatesTable();

  this.updateLedgerCurrencies();
  this.updateLedgerWallets();

  if (apiError) {
    this.handleError('api', apiError.message);
  }
  else {
    SpreadsheetApp.getActive().toast('Reports complete', 'Finished', 10);
  }

  SpreadsheetApp.setCurrentCell(currentCell);

};

/**
 * Deletes all the output sheets.
 * Not intended for use by the end user.
 * Useful in development and testing.
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
    this.exRatesTableSheetName,
    this.exRatesSheetName,
    this.fiatAccountsSheetName
  ];

  this.deleteSheets(sheetNames);

};