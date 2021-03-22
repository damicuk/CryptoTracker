/**
 * Creates the income summary report if it doesn't already exist
 * No data is writen to this sheet
 * It contains formulas that pull data from other sheets
 */
CryptoTracker.prototype.incomeSummaryReport = function () {

  const sheetName = this.incomeSummaryReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;
    
  }

  sheet = ss.insertSheet(sheetName);
  
  const referenceSheetName = this.incomeReportName;

  let headers = [
    [
      'Year',
      'Crypto',
      'Amount',
      'Income Value'
    ]
  ];

  sheet.getRange('A1:D1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('B2:B').setNumberFormat('@');
  sheet.getRange('C2:C').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('D2:D').setNumberFormat('#,##0.00;(#,##0.00)');

  const formulas = [[
    `IFERROR(SORT(UNIQUE(FILTER({YEAR('${referenceSheetName}'!A2:A),'${referenceSheetName}'!B2:B},LEN('${referenceSheetName}'!A2:A)))),)`, ,
    `ArrayFormula(SUMIF(YEAR('${referenceSheetName}'!A2:A)&'${referenceSheetName}'!B2:B, FILTER(A2:A&B2:B, LEN(A2:A)), '${referenceSheetName}'!D2:D))`,
    `ArrayFormula(SUMIF(YEAR('${referenceSheetName}'!A2:A)&'${referenceSheetName}'!B2:B, FILTER(A2:A&B2:B, LEN(A2:A)), '${referenceSheetName}'!F2:F))`
  ]];

  sheet.getRange('A2:D2').setFormulas(formulas);

  this.trimColumns(sheet, 4);

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, sheet.getMaxColumns());

  SpreadsheetApp.flush();
}