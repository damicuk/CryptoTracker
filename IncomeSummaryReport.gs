/**
 * Creates the income summary report if it doesn't already exist.
 * Updated the sheet if the version is not the current version.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 */
CryptoTracker.prototype.incomeSummaryReport = function () {

  const version = '1';
  const sheetName = this.incomeSummaryReportName;

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

  const referenceRangeName = this.incomeRangeName;

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
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,{QUERY(${referenceRangeName}, "SELECT YEAR(A), B, SUM(D), SUM(F) GROUP BY B, YEAR(A) ORDER BY YEAR(A), B LABEL YEAR(A) '', SUM(D) '', SUM(F) ''");
{QUERY(${referenceRangeName}, "SELECT YEAR(A), 'SUBTOTAL', ' ', SUM(F) GROUP BY YEAR(A) ORDER BY YEAR(A) LABEL YEAR(A) '', 'SUBTOTAL' '', ' ' '', SUM(F) ''")};
{"","TOTAL","",QUERY(${referenceRangeName}, "SELECT SUM(F) LABEL SUM(F) ''")}})`, , , ,
  ]];

  sheet.getRange('A2:D2').setFormulas(formulas);

  this.trimColumns(sheet, 4);

  sheet.autoResizeColumns(1, sheet.getMaxColumns());
};