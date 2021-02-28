function onOpen() {

  let ui = SpreadsheetApp.getUi();

  let exRatesMenu = ui.createMenu('Complete Ledger Exchange Rates')
    .addItem('Fetch Google Finance Rates', 'getGoogleFinanceExRates')
    .addItem('Fetch Historical Crypto Rates', 'getCryptoDataExRates');

  let cryptoDataMenu = ui.createMenu('Update Current Crypto Prices')
    .addItem('Fetch CryptoComapare Prices', 'getCryptoCompareData')
    .addItem('Fetch CoinMarketCap Prices', 'getCoinMarketCapData');

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

function getCryptoCompareData() {

  new CryptoTracker().getCryptoCompareData();
}

function getCoinMarketCapData() {

  new CryptoTracker().getCoinMarketCapData();
}

function validateLedger() {

  new CryptoTracker().validateLedger();

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);
}

function getGoogleFinanceExRates() {

  new CryptoTracker().getGoogleFinanceExRates();
}

function getCryptoDataExRates() {

  new CryptoTracker().getCryptoDataExRates();
}