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
QUERY({{"", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT G, Year(J), P, S, T, U, W")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY YEAR", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT G, Year(J), P, S, T, U, W")}, "SELECT Col2, ' ', '  ', '   ', '    ', '     ', SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) GROUP BY Col2 ORDER BY Col2 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT G, Year(J), P, S, T, U, W")}, "SELECT ' ', '  ', Col7, '   ', '    ', '     ', SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) GROUP BY Col7 ORDER BY Col7 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY YEAR AND HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT G, Year(J), P, S, T, U, W")}, "SELECT Col2, ' ', Col7, '  ', '   ', '    ', SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) GROUP BY Col2, Col7 ORDER BY Col2, Col7 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY CRYPTO", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT G, Year(J), P, S, T, U, W")}, "SELECT ' ', Col1, '  ', SUM(Col3), SUM(Col4) / SUM(Col3), SUM(Col5) / SUM(Col3), SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) GROUP BY Col1 ORDER BY Col1 OFFSET 1 LABEL ' ' '', '  ' '', SUM(Col3) '', SUM(Col4) / SUM(Col3) '', SUM(Col5) / SUM(Col3) '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY YEAR AND CRYPTO", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT G, Year(J), P, S, T, U, W")}, "SELECT Col2, Col1, ' ', SUM(Col3), SUM(Col4) / SUM(Col3), SUM(Col5) / SUM(Col3), SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) GROUP BY Col2, Col1 ORDER BY Col2, Col1 OFFSET 1 LABEL ' ' '', SUM(Col3) '', SUM(Col4) / SUM(Col3) '', SUM(Col5) / SUM(Col3) '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY CRYPTO AND HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT G, Year(J), P, S, T, U, W")}, "SELECT ' ', Col1, Col7, SUM(Col3), SUM(Col4) / SUM(Col3), SUM(Col5) / SUM(Col3), SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) GROUP BY Col1, Col7 ORDER BY Col1, Col7 OFFSET 1 LABEL ' ' '', SUM(Col3) '', SUM(Col4) / SUM(Col3) '', SUM(Col5) / SUM(Col3) '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY YEAR CRYPTO AND HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT G, Year(J), P, S, T, U, W")}, "SELECT Col2, Col1, Col7, SUM(Col3), SUM(Col4) / SUM(Col3), SUM(Col5) / SUM(Col3), SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) GROUP BY Col2, Col1, Col7 ORDER BY Col2, Col1, Col7 OFFSET 1 LABEL SUM(Col3) '', SUM(Col4) / SUM(Col3) '', SUM(Col5) / SUM(Col3) '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''")
})`, , , , , , , , , ,
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,QUERY(${referenceRangeName}, "SELECT G, SUM(T) GROUP BY G ORDER BY G LABEL SUM(T) ''"))`
  ]];

  sheet.getRange('A2:K2').setFormulas(formulas);

  sheet.hideColumns(11, 2);

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
};