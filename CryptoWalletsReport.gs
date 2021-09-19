/**
 * Creates the crypto wallets report if it doesn't already exist.
 * Updated the sheet if the version is not the current version.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 */
CryptoTracker.prototype.cryptoWalletsReport = function () {

  const version = '1';
  const sheetName = this.cryptoWalletsReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {
    if (this.getSheetVersion(sheet) === version) {
      return;
    }
    else {
      sheet.clear();
    }
  }
  else {
    sheet = ss.insertSheet(sheetName);
  }

  this.setSheetVersion(sheet, version);

  const referenceRangeName = this.openPositionsRangeName;

  sheet.getRange('A1:1').setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:A').setNumberFormat('@');
  sheet.getRange(2, 2, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('#,##0.00000000;(#,##0.00000000);');

  sheet.getRange('A1').setFormula(`IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,QUERY(${referenceRangeName}, "SELECT J, SUM(K) GROUP BY J PIVOT G ORDER BY J LABEL J 'Wallet'"))`);

  sheet.autoResizeColumns(1, sheet.getMaxColumns());
};