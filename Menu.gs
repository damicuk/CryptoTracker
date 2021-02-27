function onOpen() {

  let ui = SpreadsheetApp.getUi();

  let exRatesMenu = ui.createMenu('Complete Ledger Exchange Rates')
    .addItem('Fetch Google Finance Rates', 'updateExRates')
    .addItem('Fetch Historical Crypto Rates', 'updateExRates');

  let cryptoDataMenu = ui.createMenu('Fetch Current Crypto Prices')
    .addItem('Fetch CoinMarketCap Prices', 'getCoinMarketCapData')
    .addItem('Fetch CryptoComapare Prices', 'getCryptoCompareData');

  ui.createMenu('Crypto Tracker')
    .addItem('Validate Ledger', 'validateLedger')
    .addItem('Process Ledger', 'processLedger')
    .addSeparator()
    .addSubMenu(exRatesMenu)
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


