CryptoTracker.prototype.openSummaryReport = function () {

  const sheetName = this.openSummaryReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    this.trimSheet(sheet, null, 15);
    return;
  }
  
  sheet = ss.insertSheet(sheetName);

  const referenceSheetName = this.openPositionsReportName;
  const exRatesSheetName = this.exRatesSheetName;

  let headers = [
    [
      'Coin',
      'Balance',
      'Av. Buy Price',
      'Current Price',
      'Cost Basis',
      'Value',
      'Unrealized P/L',
      'Unrealized P/L %'
    ]
  ];

  sheet.getRange('A1:H1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:A').setNumberFormat('@');
  sheet.getRange('B2:B').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('C2:D').setNumberFormat('#,##0.0000;(#,##0.0000)');
  sheet.getRange('E2:F').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('G2:G').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('H2:H').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');


  const formulas = [[
    `=SORT(UNIQUE('${referenceSheetName}'!G3:G))`,
    `=ArrayFormula(SUMIF('${referenceSheetName}'!G3:G, FILTER(A2:A, LEN(A2:A)),'${referenceSheetName}'!K3:K))`,
    `=IFERROR(ArrayFormula(FILTER(E2:E/B2:B, LEN(A2:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(VLOOKUP(A2:A, '${exRatesSheetName}'!B2:D, 3, FALSE), LEN(A2:A))),)`,
    `=ArrayFormula(SUMIF('${referenceSheetName}'!G3:G, FILTER(A2:A, LEN(A2:A)),'${referenceSheetName}'!N3:N))`,
    `=IFERROR(ArrayFormula(FILTER(B2:B*D2:D, LEN(A2:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(F2:F-E2:E, LEN(A2:A))),)`,
    `=IFERROR(ArrayFormula(FILTER(G2:G/E2:E, LEN(A2:A))),)`
  ]];

  sheet.getRange('A2:H2').setFormulas(formulas);

  SpreadsheetApp.flush();

  this.trimSheet(sheet, null, 15);
  
  sheet.autoResizeColumns(1, 8);

  let pieChartBuilder = sheet.newChart().asPieChart();
  let chart = pieChartBuilder
    .addRange(sheet.getRange('A1:A1000'))
    .addRange(sheet.getRange('F1:F1000'))
    .setNumHeaders(1)
    .setTitle('Value')
    .setPosition(1, 9, 30, 30)
    .build();

  sheet.insertChart(chart);

}