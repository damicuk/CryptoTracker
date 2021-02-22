function onOpen() {

  let ui = SpreadsheetApp.getUi();

  var cryptoDataMenu = ui.createMenu('Update Crypto Prices')
    .addItem('Fetch CoinMarketCap Prices', 'getCoinMarketCapData')
    .addItem('Fetch CryptoComapare Prices', 'getCryptoCompareData');

  ui.createMenu('Crypto Tracker')
    .addItem('Validate Ledger', 'validateLedger')
    .addItem('Process Ledger', 'processLedger')
    .addItem('Update Exchange Rates (Google Finance)', 'updateExRates')
    .addSeparator()
    .addSubMenu(cryptoDataMenu)
    .addToUi();
}

function processLedger() {

  new CryptoTracker().processLedger();
}

function getCoinMarketCapData() {

  new CryptoTracker().getCoinMarketCapData();
}

function getCryptoCompareData() {

  new CryptoTracker().getCryptoCompareData();
}

function validateLedger() {

  new CryptoTracker().validateLedger();

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);
}

function updateExRates() {

  new CryptoTracker().updateExRates();
}


