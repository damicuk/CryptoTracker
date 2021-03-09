function onOpen() {

  let ui = SpreadsheetApp.getUi();
  
  let currentExRatesMenu = ui.createMenu('Update Current Ex Rates')
    .addItem('Fetch CryptoComapare Ex Rates', 'getCryptoCompareExRates')
    .addItem('Fetch CoinMarketCap Ex Rates', 'getCoinMarketCapExRates');

  ui.createMenu('Crypto Tracker')
    .addItem('Validate Ledger', 'validateLedger')
    .addItem('Process Ledger', 'processLedger')
    .addSeparator()
    .addSubMenu(currentExRatesMenu)
    .addToUi();
}

function processLedger() {

  new CryptoTracker().processLedger();
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