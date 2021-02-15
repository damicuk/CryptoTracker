function processTrades() {

  let cryptoTracker = new CryptoTracker();

  cryptoTracker.processTrades();

  let openPositionsTable = cryptoTracker.getOpenPositionsTable();
  cryptoTracker.dumpData(openPositionsTable, 'Open Positions Data');

  let closedPositionsTable = cryptoTracker.getClosedPositionsTable();
  cryptoTracker.dumpData(closedPositionsTable, 'Closed Positions Data');

}

function getSheet(name) {

  ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {

    ss.insertSheet(name);
  }
  else {

    sheet.clear();

  }

  return sheet;
}

function validateLedger() {

  new CryptoTracker().validateLedger();

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);

}

function updateExRates() {

  new CryptoTracker().updateExRates();

}

