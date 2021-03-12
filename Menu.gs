function onOpen() {

  let ui = SpreadsheetApp.getUi();

  ui.createMenu('CryptoTracker')
    .addItem('Step 1: Create sample ledger', 'createSampleLedger')
    .addSeparator()
    .addItem('Step 2: Validate ledger (optional)', 'validateLedger')
    .addSeparator()
    .addItem('Step 3: Generate reports', 'processLedger')
    .addSeparator()
    .addItem('Update exchange rates', 'updateExRates')
    .addSeparator()
    .addItem('Settings', 'showSettingsDialog')
    .addToUi();
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

function showSettingsDialog() {

  var html = HtmlService.createTemplateFromFile('SettingsDialog').evaluate();
  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}

function saveSettings(settings) {

  PropertiesService.getUserProperties().setProperties(settings);
  SpreadsheetApp.getActive().toast("Settings saved");
}
