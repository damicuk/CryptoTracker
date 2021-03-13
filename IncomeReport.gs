CryptoTracker.prototype.incomeReport = function () {

  const sheetName = this.incomeReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {
    return;
  }
  
  sheet = ss.insertSheet(sheetName);

  const referenceSheetName = this.incomeSheetName;

  let headers = [
    [
      'Date Time',
      'Currency',
      'Ex Rate',
      'Amount',
      'Wallet',
      'Income Value'
    ]
  ];

  sheet.getRange('A1:F1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('B2:B').setNumberFormat('@');
  sheet.getRange('C2:C').setNumberFormat('#,##0.00000;(#,##0.00000);');
  sheet.getRange('D2:D').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('E2:E').setNumberFormat('@');
  sheet.getRange('F2:F').setNumberFormat('#,##0.00;(#,##0.00)');

  const formulas = [[
    `=ArrayFormula('${referenceSheetName}'!A2:E)`, , , , ,
    `=IFERROR(ArrayFormula(FILTER($D2:$D*$C2:$C, LEN(A2:A))),)`
  ]];

  sheet.getRange('A2:F2').setFormulas(formulas);

  SpreadsheetApp.flush();

  this.trimColumns(sheet, 6);

  sheet.autoResizeColumns(1, 1);

}
