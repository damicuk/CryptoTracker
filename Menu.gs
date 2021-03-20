function onOpen() {

  let ui = SpreadsheetApp.getUi();

  ui.createMenu('CryptoTracker')
    .addItem('Step 1: Create sample ledger', 'createSampleLedger')
    .addSeparator()
    .addItem('Step 2: Validate ledger (optional)', 'validateLedger')
    .addSeparator()
    .addItem('Step 3: Write reports', 'showSpinner')
    .addSeparator()
    .addItem('Settings', 'showSettingsDialog')
    .addToUi();
}

function createSampleLedger() {

  new CryptoTracker().sampleLedger();
}

function validateLedger() {

  new CryptoTracker().validateLedger();

}

function showSpinner() {

  var html = HtmlService.createHtmlOutputFromFile('Spinner')
    .setWidth(250)
    .setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(html, 'Loading. Please wait.');
}

function writeReports() {
  
  new CryptoTracker().writeReports();
}

function showSettingsDialog() {

  var html = HtmlService.createTemplateFromFile('SettingsDialog').evaluate()
    .setWidth(480)
    .setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}

function saveSettings(settings) {

  let userProperties = PropertiesService.getUserProperties();
  userProperties.setProperties(settings);
  SpreadsheetApp.getActive().toast("Settings saved");
}

function deleteReports() {

  new CryptoTracker().deleteReports();

}

function deleteSettings() {

  let userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();

}