/**
 * Creates the donations summary report if it doesn't already exist
 * No data is writen to this sheet
 * It contains formulas that pull data from other sheets
 */
CryptoTracker.prototype.donationsSummaryReport = function () {

  const sheetName = this.donationsSummaryReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;
    
  }

  sheet = ss.insertSheet(sheetName);

  const referenceSheetName = this.donationsReportName;

  let headers = [
    [
      'Year',
      'Crypto',
      'Amount',
      'Cost Basis',
      'Donation Value'
    ]
  ];

  sheet.getRange('A1:E1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('B2:B').setNumberFormat('@');
  sheet.getRange('C2:C').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('D2:D').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('E2:E').setNumberFormat('#,##0.00;(#,##0.00)');

  const formulas = [[
    `IFERROR(SORT(UNIQUE(FILTER({YEAR('${referenceSheetName}'!J3:J),'${referenceSheetName}'!G3:G},LEN('${referenceSheetName}'!A3:A)))),)`, ,
    `ArrayFormula(SUMIF(YEAR('${referenceSheetName}'!J2:J)&'${referenceSheetName}'!G2:G, FILTER(A2:A&B2:B, LEN(A2:A)), '${referenceSheetName}'!M2:M))`,
    `ArrayFormula(SUMIF(YEAR('${referenceSheetName}'!J2:J)&'${referenceSheetName}'!G2:G, FILTER(A2:A&B2:B, LEN(A2:A)), '${referenceSheetName}'!P2:P))`,
    `ArrayFormula(SUMIF(YEAR('${referenceSheetName}'!J2:J)&'${referenceSheetName}'!G2:G, FILTER(A2:A&B2:B, LEN(A2:A)), '${referenceSheetName}'!Q2:Q))`
  ]];

  sheet.getRange('A2:E2').setFormulas(formulas);

  this.trimColumns(sheet, 5);

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, sheet.getMaxColumns());

  SpreadsheetApp.flush();
}