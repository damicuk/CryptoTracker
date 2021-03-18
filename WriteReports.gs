CryptoTracker.prototype.writeReports = function () {

  this.validateLedger();
  this.processLedger();
  
  let apiErrorMessage = this.updateCryptoPrices();
  
  this.openPositionsReport();
  this.closedPositionsReport();
  this.donationsReport();
  this.incomeReport();
  this.fiatWalletsReport();
  this.openSummaryReport();
  this.closedSummaryReport();
  this.incomeSummaryReport();
  this.donationsSummaryReport();
  this.cryptoWalletsReport();
  this.openPLReport();
  this.closedPLReport();
  this.exRatesTable();

  this.updateLedgerCurrencies();
  this.updateLedgerWallets();

  if(apiErrorMessage) {

    let message = `Current price data will be missing from the reports.
    
    ${apiErrorMessage}`;

    SpreadsheetApp.getUi().alert(`Failed to update crypto prices`, message, SpreadsheetApp.getUi().ButtonSet.OK);

  }
}

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
    this.exRatesTableSheetName
  ];

  this.deleteSheets(sheetNames);

}