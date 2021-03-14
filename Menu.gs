function onOpen() {

  let ui = SpreadsheetApp.getUi();

  ui.createMenu('CryptoTracker')
    .addItem('Step 1: Create sample ledger', 'createSampleLedger')
    .addSeparator()
    .addItem('Step 2: Validate ledger (optional)', 'validateLedger')
    .addSeparator()
    .addItem('Step 3: Write reports', 'writeReports')
    .addSeparator()
    .addItem('Delete all reports', 'deleteReports')
    .addSeparator()
    .addItem('Update exchange rates', 'updateExRates')
    .addSeparator()
    .addItem('Settings', 'showSettingsDialog')
    .addToUi();
}

function createSampleLedger() {

  new CryptoTracker().sampleLedger();
}

function validateLedger() {

  new CryptoTracker().validateLedger();

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);
}

function writeReports() {

  new CryptoTracker().writeReports();

}

function deleteReports() {

  new CryptoTracker().deleteReports();

}

function updateExRates() {

  new CryptoTracker().updateExRates();
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

function deleteSettings() {

  let userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();

}
