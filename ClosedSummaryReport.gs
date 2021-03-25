/**
 * Creates the closed summary report if it doesn't already exist
 * No data is writen to this sheet
 * It contains formulas that pull data from other sheets
 */
CryptoTracker.prototype.closedSummaryReport = function () {

  const sheetName = this.closedSummaryReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;

  }

  sheet = ss.insertSheet(sheetName);

  const referenceRangeName = this.closedPositionsRangeName;

  let headers = [
    [
      'Crypto',
      'Balance',
      'Cost Basis',
      'Proceeds',
      'Av. Buy Price',
      'Av. Sell Price',
      'Realized P/L',
      'Realized P/L %',
      'Proceeds (for Chart)'

    ]
  ];

  sheet.getRange('A1:I1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:A').setNumberFormat('@');
  sheet.getRange('B2:B').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('C2:D').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('E2:F').setNumberFormat('#,##0.0000;(#,##0.0000)');
  sheet.getRange('G2:G').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('H2:H').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
  sheet.getRange('I2:I').setNumberFormat('#,##0.00;(#,##0.00)');

  const formulas = [[
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,{QUERY(${referenceRangeName}, "SELECT G, SUM(P), SUM(S), SUM(T) GROUP BY G ORDER BY G LABEL SUM(P) '', SUM(S) '', SUM(T) ''", 0);
{"TOTAL", "", QUERY(${referenceRangeName}, "SELECT SUM(S), SUM(T) LABEL SUM(S) '', SUM(T) ''")}})`, , , ,
    `IF(ISBLANK(A2),,QUERY({B2:B,C2:C}, "SELECT Col2/Col1 LABEL Col2/Col1 ''", 0))`,
    `IF(ISBLANK(A2),,ArrayFormula(FILTER(D2:D/B2:B, LEN(B2:B))))`,
    `IF(ISBLANK(A2),,ArrayFormula(FILTER(D2:D-C2:C, LEN(A2:A))))`,
    `IF(ISBLANK(A2),,ArrayFormula(FILTER(G2:G/C2:C, LEN(A2:A))))`,
    `ArrayFormula(IF(LEN(B2:B),D2:D,))`
  ]];

  sheet.getRange('A2:I2').setFormulas(formulas);

  sheet.hideColumns(9);

  SpreadsheetApp.flush();

  this.trimColumns(sheet, 16);

  let pieChartBuilder = sheet.newChart().asPieChart();
  let chart = pieChartBuilder
    .addRange(sheet.getRange('A1:A1000'))
    .addRange(sheet.getRange('I1:I1000'))
    .setNumHeaders(1)
    .setTitle('Proceeds')
    .setPosition(1, 9, 30, 30)
    .build();

  sheet.insertChart(chart);

  sheet.autoResizeColumns(1, 8);

  SpreadsheetApp.flush();
}