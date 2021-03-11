CryptoTracker.prototype.fiatWalletsReport = function() {

  const sheetName = this.settings['Fiat Wallets Report'];
  const referenceSheetName = this.settings['Fiat Accounts Sheet'];

  let sheet = this.getSheet(sheetName);

  sheet.getRange('A1').setValue('Wallet');
  sheet.getRange('B1').setFormula(`=TRANSPOSE(SORT(UNIQUE('${referenceSheetName}'!B2:B)))`);

  sheet.getRange('A1:1').setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:A').setNumberFormat('@');
  sheet.getRange(2, 2, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('#,##0.00;(#,##0.00)');

  const formulas = [[
    `=SORT(UNIQUE('${referenceSheetName}'!A2:A))`,
    `=ArrayFormula(SUMIF('${referenceSheetName}'!$A$2:$A&'${referenceSheetName}'!$B$2:$B, FILTER(FILTER(A2:A&B1:1, LEN(A2:A)), LEN(B1:1)), '${referenceSheetName}'!$C$2:$C))`
  ]];

  sheet.getRange('A2:B2').setFormulas(formulas);

  SpreadsheetApp.flush();

}