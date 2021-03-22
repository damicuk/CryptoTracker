/**
 * Creates the open P/L report if it doesn't already exist
 * No data is writen to this sheet
 * It contains formulas that pull data from other sheets
 */
CryptoTracker.prototype.openPLReport = function () {

  const sheetName = this.openPLReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;

  }

  sheet = ss.insertSheet(sheetName);

  const referenceSheetName = this.openPositionsReportName;

  let headers = [
    [
      , ,
      'Short Term', , ,
      'Long Term', , ,
      'Total', , ,
    ],
    [
      'Wallet',
      'Crypto',
      'Balance',
      'Unrealized P/L',
      'Unrealized P/L %',
      'Balance',
      'Unrealized P/L',
      'Unrealized P/L %',
      'Balance',
      'Unrealized P/L',
      'Unrealized P/L %'
    ]
  ];

  sheet.getRange('A1:K2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(2);

  sheet.getRange('A1:B2').setBackgroundColor('#fce5cd');
  sheet.getRange('C1:E2').setBackgroundColor('#ead1dc');
  sheet.getRange('F1:H2').setBackgroundColor('#d0e0e3');
  sheet.getRange('I1:K2').setBackgroundColor('#c9daf8');

  sheet.getRange('C1:E1').mergeAcross();
  sheet.getRange('F1:H1').mergeAcross();
  sheet.getRange('I1:K1').mergeAcross();

  sheet.getRange('A3:B').setNumberFormat('@');
  sheet.getRange('C3:C').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
  sheet.getRange('D3:D').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('E3:E').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
  sheet.getRange('F3:F').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
  sheet.getRange('G3:G').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('H3:H').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
  sheet.getRange('I3:I').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
  sheet.getRange('J3:J').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('K3:K').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

  const formulas = [[
    `SORT(UNIQUE({'${referenceSheetName}'!J3:J,'${referenceSheetName}'!G3:G}))`, ,
    `ArrayFormula(SUMIF('${referenceSheetName}'!J3:J&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!R3:R, FILTER(A3:A&B3:B&"SHORT", LEN(A3:A)), '${referenceSheetName}'!K3:K))`,
    `ArrayFormula(IF(C3:C=0,,SUMIF('${referenceSheetName}'!J3:J&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!R3:R, FILTER(A3:A&B3:B&"SHORT", LEN(A3:A)), '${referenceSheetName}'!P3:P)))`,
    `ArrayFormula(IFERROR(FILTER(D3:D, LEN(A3:A)) / SUMIF('${referenceSheetName}'!J3:J&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!R3:R, FILTER(A3:A&B3:B&"SHORT", LEN(A3:A)), '${referenceSheetName}'!N3:N),))`,
    `ArrayFormula(SUMIF('${referenceSheetName}'!J3:J&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!R3:R, FILTER(A3:A&B3:B&"LONG", LEN(A3:A)), '${referenceSheetName}'!K3:K))`,
    `ArrayFormula(IF(F3:F=0,,SUMIF('${referenceSheetName}'!J3:J&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!R3:R, FILTER(A3:A&B3:B&"LONG", LEN(A3:A)), '${referenceSheetName}'!P3:P)))`,
    `ArrayFormula(IFERROR(FILTER(G3:G, LEN(A3:A)) / SUMIF('${referenceSheetName}'!J3:J&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!R3:R, FILTER(A3:A&B3:B&"LONG", LEN(A3:A)), '${referenceSheetName}'!N3:N),))`,
    `ArrayFormula(SUMIF('${referenceSheetName}'!J3:J&'${referenceSheetName}'!G3:G, FILTER(A3:A&B3:B, LEN(A3:A)), '${referenceSheetName}'!K3:K))`,
    `ArrayFormula(IF(I3:I=0,,SUMIF('${referenceSheetName}'!J3:J&'${referenceSheetName}'!G3:G, FILTER(A3:A&B3:B, LEN(A3:A)), '${referenceSheetName}'!P3:P)))`,
    `ArrayFormula(IFERROR(FILTER(J3:J, LEN(A3:A)) / SUMIF('${referenceSheetName}'!J3:J&'${referenceSheetName}'!G3:G, FILTER(A3:A&B3:B, LEN(A3:A)), '${referenceSheetName}'!N3:N),))`
  ]];

  sheet.getRange('A3:K3').setFormulas(formulas);

  this.trimColumns(sheet, 11);

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, sheet.getMaxColumns());

  SpreadsheetApp.flush();
}