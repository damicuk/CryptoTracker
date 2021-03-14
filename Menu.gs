function onOpen() {

  let ui = SpreadsheetApp.getUi();

  ui.createMenu('CryptoTracker')
    .addItem('Step 1: Create sample ledger', 'createSampleLedger')
    .addSeparator()
    .addItem('Step 2: Write reports', 'writeReports')
    .addSeparator()
    .addItem('Delete all reports', 'deleteReports')
    .addSeparator()
    .addItem('Settings', 'showSettingsDialog')
    .addToUi();
}

function createSampleLedger() {

  new CryptoTracker().sampleLedger();
}

function writeReports() {

  new CryptoTracker().writeReports();
}

function deleteReports() {

  new CryptoTracker().deleteReports();

}

function showSettingsDialog() {

  var html = HtmlService.createTemplateFromFile('SettingsDialog').evaluate()
    .setWidth(480)
    .setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}

function saveSettings(settings) {

  let userProperties = PropertiesService.getUserProperties()
  userProperties.setProperties(settings);
  SpreadsheetApp.getActive().toast("Settings saved");
}

function validateLedger() {

  new CryptoTracker().validateLedger();

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);
}

function updateCryptoPrices() {

  new CryptoTracker().updateCryptoPrices();
}

function deleteSettings() {

  let userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();

}