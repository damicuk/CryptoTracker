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
      'Year',
      'Crypto',
      'Holding Period',
      'Balance',
      'Av. Buy Price',
      'Av. Sell Price',
      'Cost Basis',
      'Proceeds',
      'Realized P/L',
      'Realized P/L %',
      'Crypto (chart)',
      'Proceeds (chart)'

    ]
  ];

  sheet.getRange('A1:L1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('B2:C').setNumberFormat('@');
  sheet.getRange('D2:D').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('E2:F').setNumberFormat('#,##0.0000;(#,##0.0000)');
  sheet.getRange('G2:H').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('I2:I').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('J2:J').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
  sheet.getRange('K2:K').setNumberFormat('@');
  sheet.getRange('L2:L').setNumberFormat('#,##0.00;(#,##0.00)');

  sheet.clearConditionalFormatRules();
  this.addLongShortCondition(sheet, 'C3:C');

  const formulas = [[
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,{
QUERY(${referenceRangeName}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', SUM(S), SUM(T), SUM(U), SUM(U) / SUM(S) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(S) '', SUM(T) '', SUM(U) '', SUM(U) / SUM(S) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY YEAR", "", "", "", "", "", "", "", "", ""};
QUERY(${referenceRangeName}, "SELECT YEAR(J), ' ', '  ', '   ', '    ', '     ', SUM(S), SUM(T), SUM(U), SUM(U) / SUM(S) GROUP BY YEAR(J) ORDER BY YEAR(J) LABEL YEAR(J) '', ' ' '', '  ' '', '   ' '',  '    ' '', '     ' '', SUM(S) '', SUM(T) '', SUM(U) '', SUM(U) / SUM(S) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY(${referenceRangeName}, "SELECT ' ', '  ', W, '   ', '    ', '     ', SUM(S), SUM(T), SUM(U), SUM(U) / SUM(S) GROUP BY W ORDER BY W LABEL ' ' '', '  ' '', '   ' '',  '    ' '', '     ' '', SUM(S) '', SUM(T) '', SUM(U) '', SUM(U) / SUM(S) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY YEAR AND HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY(${referenceRangeName}, "SELECT YEAR(J), ' ', W, '  ', '   ', '    ', SUM(S), SUM(T), SUM(U), SUM(U) / SUM(S) GROUP BY YEAR(J), W ORDER BY YEAR(J), W LABEL YEAR(J) '', ' ' '', '  ' '',  '   ' '', '    ' '', SUM(S) '', SUM(T) '', SUM(U) '', SUM(U) / SUM(S) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY CRYPTO", "", "", "", "", "", "", "", "", ""};
{QUERY(${referenceRangeName}, "SELECT ' ', G, '  ', SUM(P), SUM(S) / SUM(P), SUM(T) / SUM(P), SUM(S), SUM(T), SUM(U), SUM(U) / SUM(S) GROUP BY G ORDER BY G LABEL ' ' '', '  ' '', SUM(P) '',  SUM(S) / SUM(P) '', SUM(T) / SUM(P) '', SUM(S) '', SUM(T) '', SUM(U) '', SUM(U) / SUM(S) ''")};
{"", "", "", "", "", "", "", "", "", ""};
{"BY YEAR AND CRYPTO", "", "", "", "", "", "", "", "", ""};
{QUERY(${referenceRangeName}, "SELECT YEAR(J), G, ' ', SUM(P), SUM(S) / SUM(P), SUM(T) / SUM(P), SUM(S), SUM(T), SUM(U), SUM(U) / SUM(S) GROUP BY YEAR(J), G ORDER BY YEAR(J), G LABEL YEAR(J) '', ' ' '', SUM(P) '',  SUM(S) / SUM(P) '', SUM(T) / SUM(P) '', SUM(S) '', SUM(T) '', SUM(U) '', SUM(U) / SUM(S) ''")};
{"", "", "", "", "", "", "", "", "", ""};
{"BY CRYPTO AND HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY(${referenceRangeName}, "SELECT ' ', G, W, SUM(P), SUM(S) / SUM(P), SUM(T) / SUM(P), SUM(S), SUM(T), SUM(U), SUM(U) / SUM(S) GROUP BY G, W ORDER BY G, W LABEL ' ' '', SUM(P) '',  SUM(S) / SUM(P) '', SUM(T) / SUM(P) '', SUM(S) '', SUM(T) '', SUM(U) '', SUM(U) / SUM(S) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY YEAR CRYPTO AND HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY(${referenceRangeName}, "SELECT YEAR(J), G, W, SUM(P), SUM(S) / SUM(P), SUM(T) / SUM(P), SUM(S), SUM(T), SUM(U), SUM(U) / SUM(S) GROUP BY YEAR(J), G, W ORDER BY YEAR(J), G, W LABEL YEAR(J) '', SUM(P) '',  SUM(S) / SUM(P) '', SUM(T) / SUM(P) '', SUM(S) '', SUM(T) '', SUM(U) '', SUM(U) / SUM(S) ''")
})`, , , , , , , , , ,
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,QUERY(${referenceRangeName}, "SELECT G, SUM(T) GROUP BY G ORDER BY G LABEL SUM(T) ''"))`
  ]];

  sheet.getRange('A2:K2').setFormulas(formulas);

  sheet.hideColumns(11, 2);

  SpreadsheetApp.flush();

  this.trimColumns(sheet, 19);

  let pieChartBuilder = sheet.newChart().asPieChart();
  let chart = pieChartBuilder
    .addRange(sheet.getRange('K2:L1000'))
    .setNumHeaders(0)
    .setTitle('Proceeds')
    .setPosition(1, 13, 30, 30)
    .build();

  sheet.insertChart(chart);

  sheet.autoResizeColumns(1, 14);

  SpreadsheetApp.flush();
}