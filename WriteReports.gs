CryptoTracker.prototype.writeReports = function () {

  let ledgerProcessed = this.processLedger();

  if(!ledgerProcessed) {

    return false;

  }

  let apiErrorMessage;
  
  try {

    this.exRatesSheet();

  }
  catch(err) {

    apiErrorMessage = err.message;

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
  this.openPLReport();
  this.closedPLReport();
  this.exRatesTable();

  this.updateLedgerCurrencies();
  this.updateLedgerWallets();

  if (apiErrorMessage) {

    SpreadsheetApp.getUi().alert(`Failed to update crypto prices`, apiErrorMessage, SpreadsheetApp.getUi().ButtonSet.OK);

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