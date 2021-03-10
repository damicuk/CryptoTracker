function closedPositionsReport() {

  let sheet = getSheet('Closed Positions Report 2');

  let headers = [
    [
      'Buy Debit', , , , , ,
      'Buy Credit', , ,
      'Sell Credit', , , , , ,
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
      'Currency',
      'Ex Rate',
      'Amount',
      'Fee',
      'Wallet',
      'Balance',
      'Cost Price',
      'Current Price',
      'Cost Basis',
      'Current Value',
      'Unrealized P/L',
      'Unrealized P/L %',
      'Long / Short Term'
    ]
  ];

  sheet.getRange('A1:W2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(2);

  sheet.getRange('A1:F2').setBackgroundColor('#ead1dc');
  sheet.getRange('G1:I2').setBackgroundColor('#d0e0e3');
  sheet.getRange('J1:O2').setBackgroundColor('#d9ead3');
  sheet.getRange('P1:W2').setBackgroundColor('#c9daf8');

  sheet.getRange('A1:F1').mergeAcross();
  sheet.getRange('G1:I1').mergeAcross();
  sheet.getRange('J1:O1').mergeAcross();
  sheet.getRange('P1:W1').mergeAcross();

  sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('B3:B').setNumberFormat('@');
  sheet.getRange('C3:C').setNumberFormat('#,##0.00000;(#,##0.00000);');
  sheet.getRange('D3:D').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('E3:E').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
  sheet.getRange('F3:G').setNumberFormat('@');
  sheet.getRange('H3:H').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('I3:I').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
  sheet.getRange('J3:J').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('K3:K').setNumberFormat('@');
  sheet.getRange('L3:L').setNumberFormat('#,##0.00000;(#,##0.00000);');
  sheet.getRange('M3:M').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('N3:N').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
  sheet.getRange('O3:O').setNumberFormat('@');
  sheet.getRange('P3:P').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('Q3:T').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('U3:U').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('V3:V').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
  sheet.getRange('W3:W').setNumberFormat('@');

  addLongShortCondition(sheet, 'W3:W');

  const formulas = [[
    `=ArrayFormula('Closed Positions Data'!A2:O)`, , , , , , , , , , , , , , ,
    `=IFERROR(ArrayFormula(FILTER($H3:$H-$I3:$I, LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(S3:S/$P3:$P, LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(T3:T/$P3:$P, LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(IF($C3:$C, ($D3:$D+$E3:$E)*$C3:$C, $D3:$D+$E3:$E), LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(IF($L3:$L, ($M3:$M-$N3:$N)*$L3:$L, $M3:$M-$N3:$N), LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER($T3:T-$S3:S, LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER($U3:U/$S3:S, LEN(A3:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(IF((DATEDIF($A3:$A, $J3:$J, "Y") > 1)+(((DATEDIF($A3:$A, $J3:$J, "Y") = 1)*(DATEDIF($A3:$A, $J3:$J, "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A))),)`
  ]];

  sheet.getRange('A3:W3').setFormulas(formulas);

  tidySheet(sheet, 23);

}

