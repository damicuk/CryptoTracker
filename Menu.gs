function onOpen() {

  let ui = SpreadsheetApp.getUi();

  ui.createMenu('Crypto Tracker')
    .addItem('Validate Ledger', 'validateLedger')
    .addItem('Process Ledger', 'processLedger')
    .addSeparator()
    .addItem('Update Exchange Rates', 'updateExRates')
    .addToUi();
}

function getCryptoCompareExRates() {

  new CryptoTracker().getCryptoCompareExRates();
}

function getCoinMarketCapExRates() {

  new CryptoTracker().getCoinMarketCapExRates();
}

function validateLedger() {

  new CryptoTracker().validateLedger();

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);
}

function processLedger() {

  new CryptoTracker().processLedger();
}

function updateExRates() {

  new CryptoTracker().updateExRates();
}

function writeReports() {

  let cryptoTracker = new CryptoTracker();

  cryptoTracker.openPositionsReport();
  cryptoTracker.closedPositionsReport();
  cryptoTracker.donationsReport();
  cryptoTracker.incomeReport();
  cryptoTracker.openSummaryReport();
  cryptoTracker.closedSummaryReport();
  cryptoTracker.incomeSummaryReport();
  cryptoTracker.donationsSummaryReport();
  cryptoTracker.cryptoWalletsReport();
  cryptoTracker.fiatWalletsReport();
  cryptoTracker.openPLReport();
  cryptoTracker.closedPLReport();
  cryptoTracker.exRatesTable();

}

function deleteReports() {
  
  new CryptoTracker().deleteReports();

}

function writeSampleLedger() {

  new CryptoTracker().sampleLedger();
}
