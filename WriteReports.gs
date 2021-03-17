CryptoTracker.prototype.writeReports = function () {

  this.validateLedger();
  this.processLedger();
  
  let apiErrorMessage = this.updateCryptoPrices();
  
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

  this.hideEmptyReports();

  if(apiErrorMessage) {

    let message = `Current price data will be missing from the reports.
    
    ${apiErrorMessage}`;

    SpreadsheetApp.getUi().alert(`Failed to update crypto prices`, message, SpreadsheetApp.getUi().ButtonSet.OK);

  }
}

CryptoTracker.prototype.hideEmptyReports = function () {

  let hasLots = this.hasLots;
  let hasClosedLots = this.hasClosedLots;
  let hasIncomeLots = this.hasIncomeLots;
  let hasDonatedLots = this.hasDonatedLots;
  let hasFiats = this.hasFiats;

  this.toggleVisibility(this.openPositionsReportName, hasLots);
  this.toggleVisibility(this.openSummaryReportName, hasLots);
  this.toggleVisibility(this.cryptoWalletsReportName, hasLots);
  this.toggleVisibility(this.openPLReportName, hasLots);

  this.toggleVisibility(this.closedPositionsReportName, hasClosedLots);
  this.toggleVisibility(this.closedSummaryReportName, hasClosedLots);
  this.toggleVisibility(this.closedPLReportName, hasClosedLots);

  this.toggleVisibility(this.incomeReportName, hasIncomeLots);
  this.toggleVisibility(this.incomeSummaryReportName, hasIncomeLots);

  this.toggleVisibility(this.donationsReportName, hasDonatedLots);
  this.toggleVisibility(this.donationsSummaryReportName, hasDonatedLots);

  this.toggleVisibility(this.fiatWalletsReportName, hasFiats);

}

CryptoTracker.prototype.deleteDataSheets = function () {

  let sheetNames = [
    this.openPositionsSheetName,
    this.closedPositionsSheetName,
    this.incomeSheetName,
    this.donationsSheetName,
    this.fiatAccountsSheetName,
    this.exRatesSheetName
  ];

  this.deleteSheets(sheetNames);

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