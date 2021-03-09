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
