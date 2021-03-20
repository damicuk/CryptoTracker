function onOpen() {

  let ui = SpreadsheetApp.getUi();

  ui.createMenu('CryptoTracker')
    .addItem('Step 1: Create sample ledger', 'createSampleLedger')
    .addSeparator()
    .addItem('Step 2: Validate ledger', 'validateLedger')
    .addSeparator()
    .addItem('Step 3: Write reports', 'writeReports')
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
  if (settings.apiKey && settings.apiKey !== userProperties.apiKey) {

    let cryptoTracker = new CryptoTracker();
    let data = cryptoTracker.getCryptoPriceData('BTC', 'USD', settings.apiKey);
    if (data.Response === 'Error') {

      cryptoTracker.handleError('settings', 'Invalid API key');
      return;
    }
  }

  userProperties.setProperties(settings);
  SpreadsheetApp.getActive().toast('Settings saved');
}

function deleteReports() {

  new CryptoTracker().deleteReports();

}

function deleteSettings() {

  let userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();

}