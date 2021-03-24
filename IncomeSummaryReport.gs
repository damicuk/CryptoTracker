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
    `IFERROR({QUERY(Income, "SELECT YEAR(A), B, SUM(D), SUM(F) GROUP BY B, YEAR(A) ORDER BY YEAR(A), B LABEL YEAR(A) '', SUM(D) '', SUM(F) ''");
{QUERY(Income, "SELECT YEAR(A), 'SUBTOTAL', ' ', SUM(F) GROUP BY YEAR(A) ORDER BY YEAR(A) LABEL YEAR(A) '', 'SUBTOTAL' '', ' ' '', SUM(F) ''")};
{"","TOTAL","",QUERY(Income, "SELECT SUM(F) LABEL SUM(F) ''")}},)`, , , ,
  ]];

  sheet.getRange('A2:D2').setFormulas(formulas);

  this.trimColumns(sheet, 4);

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, sheet.getMaxColumns());

  SpreadsheetApp.flush();
}