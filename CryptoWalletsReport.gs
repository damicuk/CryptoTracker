function cryptoWalletsReport() {

  const sheetName = 'Crypto Wallets Report 2';
  const referenceSheetName = 'Open Positions Report 2';

  let sheet = ReportHelper.getSheet(sheetName);

  sheet.getRange('A1').setValue('Wallet');
  sheet.getRange('B1').setFormula(`=TRANSPOSE(SORT(UNIQUE('${referenceSheetName}'!G3:G)))`);

  sheet.getRange('A1:1').setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:A').setNumberFormat('@');
  sheet.getRange(2, 2, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('#,##0.00000000;(#,##0.00000000);');

  const formulas = [[
    `=SORT(UNIQUE('${referenceSheetName}'!J3:J))`,
    `=ARRAYFORMULA(SUMIF('${referenceSheetName}'!J3:J&'${referenceSheetName}'!G3:G, FILTER(FILTER(A2:A&B1:1, LEN(A2:A)), LEN(B1:1)), '${referenceSheetName}'!K3:K))`
  ]];

  sheet.getRange('A2:B2').setFormulas(formulas);

  SpreadsheetApp.flush();

}