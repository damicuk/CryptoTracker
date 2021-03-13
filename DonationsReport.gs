CryptoTracker.prototype.donationsReport = function () {

  const sheetName = this.donationsReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {
    return;
  }
  
  sheet = ss.insertSheet(sheetName);

  const referenceSheetName = this.donationsSheetName;

  let headers = [
    [
      'Buy Debit', , , , , ,
      'Buy Credit', , ,
      'Donation Debit', , ,
      'Calculations', , , , , , , ,
    ],
    [
      'Date Time',
      'Currency',
      'Ex Rate',
      'Amount',
      'Fee',
      'Wallet',
      'Currency',
      'Amount',
      'Fee',
      'Date Time',
      'Ex Rate',
      'Wallet',
      'Balance',
      'Cost Price',
      'Donation Price',
      'Cost Basis',
      'Donation Value',
      'Notional P/L',
      'Notional P/L %',
      'Long / Short Term'
    ]
  ];

  sheet.getRange('A1:T2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(2);

  sheet.getRange('A1:F2').setBackgroundColor('#ead1dc');
  sheet.getRange('G1:I2').setBackgroundColor('#d0e0e3');
  sheet.getRange('J1:L2').setBackgroundColor('#ead1dc');
  sheet.getRange('M1:T2').setBackgroundColor('#c9daf8');

  sheet.getRange('A1:F1').mergeAcross();
  sheet.getRange('G1:I1').mergeAcross();
  sheet.getRange('J1:L1').mergeAcross();
  sheet.getRange('M1:T1').mergeAcross();

  sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('B3:B').setNumberFormat('@');
  sheet.getRange('C3:C').setNumberFormat('#,##0.00000;(#,##0.00000);');
  sheet.getRange('D3:D').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('E3:E').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
  sheet.getRange('F3:G').setNumberFormat('@');
  sheet.getRange('H3:H').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('I3:I').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
  sheet.getRange('J3:J').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('K3:K').setNumberFormat('#,##0.00000;(#,##0.00000);');
  sheet.getRange('L3:L').setNumberFormat('@');
  sheet.getRange('M3:M').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('N3:Q').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('R3:R').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('S3:S').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
  sheet.getRange('T3:T').setNumberFormat('@');

  sheet.clearConditionalFormatRules();
  this.addLongShortCondition(sheet, 'T3:T');

  const formulas = [[
    `=ArrayFormula('${referenceSheetName}'!A2:L)`, , , , , , , , , , , ,
    `=IFERROR(ArrayFormula(FILTER($H3:$H-$I3:$I, LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(P3:P/$M3:$M, LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(Q3:Q/$M3:$M, LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(IF($C3:$C, ($D3:$D+$E3:$E)*$C3:$C, $D3:$D+$E3:$E), LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER($K3:$K*$M3:$M, LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER($Q3:Q-$P3:P, LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER($R3:R/$P3:P, LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(IF((DATEDIF($A3:$A, $J3:$J, "Y") > 1)+(((DATEDIF($A3:$A, $J3:$J, "Y") = 1)*(DATEDIF($A3:$A, $J3:$J, "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A))),)`
  ]];

  sheet.getRange('A3:T3').setFormulas(formulas);

  SpreadsheetApp.flush();

  this.trimColumns(sheet, 20);

  sheet.autoResizeColumns(1, 20);

}

