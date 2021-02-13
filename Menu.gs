function onOpen() {

  let ui = SpreadsheetApp.getUi();
  ui.createMenu('Crypto Tracker')
    .addItem('Process Trades', 'processTrades')
    .addSeparator()
    .addItem('Validate Ledger', 'processTrades')
    .addItem('Update Exchange Rates', 'updateExRates')
    .addSeparator()
    .addItem('More Stuff', 'processTrades')
    .addToUi();
}


