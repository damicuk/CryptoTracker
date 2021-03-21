/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
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

  let html = HtmlService.createTemplateFromFile('SettingsDialog').evaluate()
    .setWidth(480)
    .setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}

function saveSettings(settings) {

  new CryptoTracker().saveSettings(settings);
  
}

function deleteReports() {

  new CryptoTracker().deleteReports();

}

function deleteSettings() {

  let userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();

}