CryptoTracker.prototype.closedPLReport = function () {

  const sheetName = this.closedPLReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    this.adjustSheet(sheet);
    return;
  }

  sheet = ss.insertSheet(sheetName);

  const referenceSheetName = this.closedPositionsReportName;

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
      'Realized P/L',
      'Realized P/L %',
      'Balance',
      'Realized P/L',
      'Realized P/L %',
      'Balance',
      'Realized P/L',
      'Realized P/L %'
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

  sheet.getRange('B3:B').setNumberFormat('@');
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
    `=IFERROR(SORT(UNIQUE(FILTER({YEAR('${referenceSheetName}'!J3:J),'${referenceSheetName}'!G3:G},LEN('${referenceSheetName}'!A3:A)))),)`, ,
    `=ArrayFormula(SUMIF(YEAR('${referenceSheetName}'!J3:J)&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!W3:W, FILTER(A3:A&B3:B&"SHORT", LEN(A3:A)), '${referenceSheetName}'!P3:P))`,
    `=ArrayFormula(SUMIF(YEAR('${referenceSheetName}'!J3:J)&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!W3:W, FILTER(A3:A&B3:B&"SHORT", LEN(A3:A)), '${referenceSheetName}'!U3:U))`,
    `=ArrayFormula(IFERROR(FILTER(D3:D, LEN(A3:A)) / SUMIF(YEAR('${referenceSheetName}'!J3:J)&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!W3:W, FILTER(A3:A&B3:B&"SHORT", LEN(A3:A)), '${referenceSheetName}'!S3:S),))`,
    `=ArrayFormula(SUMIF(YEAR('${referenceSheetName}'!J3:J)&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!W3:W, FILTER(A3:A&B3:B&"LONG", LEN(A3:A)), '${referenceSheetName}'!P3:P))`,
    `=ArrayFormula(SUMIF(YEAR('${referenceSheetName}'!J3:J)&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!W3:W, FILTER(A3:A&B3:B&"LONG", LEN(A3:A)), '${referenceSheetName}'!U3:U))`,
    `=ArrayFormula(IFERROR(FILTER(G3:G, LEN(A3:A)) / SUMIF(YEAR('${referenceSheetName}'!J3:J)&'${referenceSheetName}'!G3:G&'${referenceSheetName}'!W3:W, FILTER(A3:A&B3:B&"LONG", LEN(A3:A)), '${referenceSheetName}'!S3:S),))`,
    `=ArrayFormula(SUMIF(YEAR('${referenceSheetName}'!J3:J)&'${referenceSheetName}'!G3:G, FILTER(A3:A&B3:B, LEN(A3:A)), '${referenceSheetName}'!P3:P))`,
    `=ArrayFormula(SUMIF(YEAR('${referenceSheetName}'!J3:J)&'${referenceSheetName}'!G3:G, FILTER(A3:A&B3:B, LEN(A3:A)), '${referenceSheetName}'!U3:U))`,
    `=ArrayFormula(IFERROR(FILTER(J3:J, LEN(A3:A)) / SUMIF(YEAR('${referenceSheetName}'!J3:J)&'${referenceSheetName}'!G3:G, FILTER(A3:A&B3:B, LEN(A3:A)), '${referenceSheetName}'!S3:S),))`
  ]];

  sheet.getRange('A3:K3').setFormulas(formulas);

  SpreadsheetApp.flush();

  this.adjustSheet(sheet);

}