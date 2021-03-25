/**
 * Creates the fiat wallets report if it doesn't already exist
 * No data is writen to this sheet
 * It contains formulas that pull data from other sheets
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

  sheet.getRange('A1').setValue('Wallet');
  sheet.getRange('B1').setFormula(`TRANSPOSE(SORT(UNIQUE(QUERY(${referenceRangeName}, "SELECT B"))))`);

  sheet.getRange('A1:1').setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:A').setNumberFormat('@');
  sheet.getRange(2, 2, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('#,##0.00;(#,##0.00)');

  const formulas = [[
    `SORT(UNIQUE(QUERY(${referenceRangeName}, "SELECT A")))`,
    `ArrayFormula(IFNA(VLOOKUP(FILTER(A2:A, LEN(A2:A))&FILTER(B1:1, LEN(B1:1)), {QUERY(${referenceRangeName}, "SELECT A")&QUERY(${referenceRangeName}, "SELECT B"), QUERY(${referenceRangeName}, "SELECT C")}, 2, FALSE),))`
  ]];

  sheet.getRange('A2:B2').setFormulas(formulas);

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, sheet.getMaxColumns());

  SpreadsheetApp.flush();
}