function onOpen() {

  let ui = SpreadsheetApp.getUi();
  ui.createMenu('Crypto Tracker')
    //.addSubMenu('Ledger')
    .addItem('Process Trades', 'processTrades')
    .addItem('Validate Ledger', 'processTrades')
    .addItem('Update Exchange Rates (Google Finance)', 'updateExRates')
    .addSeparator()
    //.addSubMenu('Latest Crypto Prices')
    .addItem('Fetch CoinMarketCap Prices', 'getCoinMarketCapData')
    .addItem('Fetch CryptoComapare Prices', 'getCryptoCompareData')
    .addSeparator()
    .addItem('More Stuff', 'processTrades')
    .addToUi();
}

function processTrades() {

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


