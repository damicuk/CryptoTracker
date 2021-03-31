/**
 * Creates the fiat wallets report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 */
CryptoTracker.prototype.fiatWalletsReport = function () {

  const sheetName = this.fiatWalletsReportName;
  
  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;
    
  }

  sheet = ss.insertSheet(sheetName);

  const referenceRangeName = this.fiatAccountsRangeName;

  sheet.getRange('A1:1').setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:A').setNumberFormat('@');
  sheet.getRange(2, 2, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('#,##0.00;(#,##0.00)');

  sheet.getRange('A1').setFormula(`IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,QUERY(${referenceRangeName}, "SELECT A, SUM(C) GROUP BY A PIVOT B ORDER BY A LABEL A 'Wallet'"))`);

  sheet.autoResizeColumns(1, sheet.getMaxColumns());
};