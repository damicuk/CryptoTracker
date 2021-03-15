CryptoTracker.prototype.writeReports = function () {

  this.validateLedger();
  this.processLedger();

  this.dataSheets();
  
  this.updateCryptoPrices();

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