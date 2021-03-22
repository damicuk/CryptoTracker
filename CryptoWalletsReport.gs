/**
 * Creates the crypto wallets report if it doesn't already exist
 * No data is writen to this sheet
 * It contains formulas that pull data from other sheets
 */
CryptoTracker.prototype.cryptoWalletsReport = function () {

  const sheetName = this.cryptoWalletsReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;
    
  }

  sheet = ss.insertSheet(sheetName);

  const referenceSheetName = this.openPositionsReportName;

  sheet.getRange('A1').setValue('Wallet');
  sheet.getRange('B1').setFormula(`=TRANSPOSE(SORT(UNIQUE('${referenceSheetName}'!G3:G)))`);

  sheet.getRange('A1:1').setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:A').setNumberFormat('@');
  sheet.getRange(2, 2, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('#,##0.00000000;(#,##0.00000000);');

  const formulas = [[
    `SORT(UNIQUE('${referenceSheetName}'!J3:J))`,
    `ARRAYFORMULA(SUMIF('${referenceSheetName}'!J3:J&'${referenceSheetName}'!G3:G, FILTER(A2:A, LEN(A2:A))&FILTER(B1:1, LEN(B1:1)), '${referenceSheetName}'!K3:K))`
  ]];

  sheet.getRange('A2:B2').setFormulas(formulas);

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, sheet.getMaxColumns());

  SpreadsheetApp.flush();
}