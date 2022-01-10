/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger. To
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
 * @param {Object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu('CryptoTracker')
    .addItem('Upgrade to WealthLedger', 'upgradeToWealthLedger')
    .addSeparator()
    .addItem('Step 1: Create sample ledger', 'createSampleLedger')
    .addSeparator()
    .addItem('Step 2: Validate ledger', 'validateLedger')
    .addSeparator()
    .addItem('Step 3: Write reports', 'writeReports')
    .addSeparator()
    .addItem('Settings', 'showSettingsDialog')
    .addToUi();
}

/**
 * Calls the corresponding method of a new instance of CryptoTracker
 */
function upgradeToWealthLedger() {

  new CryptoTracker().upgradeToWealthLedger();
}

/**
 * Calls the corresponding method of a new instance of CryptoTracker
 */
function createSampleLedger() {

  new CryptoTracker().sampleLedger();
}

/**
 * Calls the corresponding method of a new instance of CryptoTracker
 */
function validateLedger() {

  new CryptoTracker().validateLedger();

}

/**
 * Calls the corresponding method of a new instance of CryptoTracker
 */
function writeReports() {

  new CryptoTracker().writeReports();
}

/**
 * Displays the settings dialog
 */
function showSettingsDialog() {

  let html = HtmlService.createTemplateFromFile('SettingsDialog').evaluate()
    .setWidth(480)
    .setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}

/**
 * Calls the corresponding method of a new instance of CryptoTracker
 */
function saveSettings(settings) {

  new CryptoTracker().saveSettings(settings);
  
}

/**
 * Calls the corresponding method of a new instance of CryptoTracker
 * Not intended for use by the end user
 * Useful in development and testing
 */
function deleteReports() {

  new CryptoTracker().deleteReports();

}

/**
 * Deletes all the user properties
 * Not intended for use by the end user
 * Useful in development and testing
 */
function deleteSettings() {

  let userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();

}