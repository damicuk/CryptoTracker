function onOpen() {
  
  let ui = SpreadsheetApp.getUi();
  ui.createMenu('Crypto Tracker')
    .addItem('Process Trades', 'processTrades')
    .addSeparator()
    .addItem('Validate Ledger', 'processTrades')
    .addItem('More Stuff', 'processTrades')
    .addSeparator()
    .addItem('More Stuff', 'processTrades')
    .addToUi();
}
