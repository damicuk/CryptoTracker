/**
 * Creates the open summary report if it doesn't already exist
 * No data is writen to this sheet
 * It contains formulas that pull data from other sheets
 */
CryptoTracker.prototype.openSummaryReport = function () {

  const sheetName = this.openSummaryReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;

  }

  sheet = ss.insertSheet(sheetName);

  const referenceRangeName = this.openPositionsRangeName;

  let headers = [
    [
      'Wallet',
      'Crypto',
      'Holding Period',
      'Balance',
      'Av. Buy Price',
      'Current Price',
      'Cost Basis',
      'Value',
      'Unrealized P/L',
      'Unrealized P/L %',
      'Crypto (chart)',
      'Value (chart)'

    ]
  ];

  sheet.getRange('A1:L1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:C').setNumberFormat('@');
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
QUERY(${referenceRangeName}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', SUM(N), SUM(O), SUM(P), SUM(P) / SUM(N) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(N) '', SUM(O) '', SUM(P) '', SUM(P) / SUM(N) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY WALLET", "", "", "", "", "", "", "", "", ""};
QUERY(${referenceRangeName}, "SELECT J, ' ', '  ', '   ', '    ', '     ', SUM(N), SUM(O), SUM(P), SUM(P) / SUM(N) GROUP BY J ORDER BY J LABEL ' ' '', '  ' '', '   ' '',  '    ' '', '     ' '', SUM(N) '', SUM(O) '', SUM(P) '', SUM(P) / SUM(N) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY(${referenceRangeName}, "SELECT ' ', '  ', R, '   ', '    ', '     ', SUM(N), SUM(O), SUM(P), SUM(P) / SUM(N) GROUP BY R ORDER BY R LABEL ' ' '', '  ' '', '   ' '',  '    ' '', '     ' '', SUM(N) '', SUM(O) '', SUM(P) '', SUM(P) / SUM(N) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY WALLET AND HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY(${referenceRangeName}, "SELECT J, ' ', R, '  ', '   ', '    ', SUM(N), SUM(O), SUM(P), SUM(P) / SUM(N) GROUP BY J, R ORDER BY J, R LABEL ' ' '', '  ' '',  '   ' '', '    ' '', SUM(N) '', SUM(O) '', SUM(P) '', SUM(P) / SUM(N) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY CRYPTO", "", "", "", "", "", "", "", "", ""};
{QUERY(${referenceRangeName}, "SELECT ' ', G, '  ', SUM(K), SUM(N) / SUM(K), SUM(O) / SUM(K), SUM(N), SUM(O), SUM(P), SUM(P) / SUM(N) GROUP BY G ORDER BY G LABEL ' ' '', '  ' '', SUM(K) '',  SUM(N) / SUM(K) '', SUM(O) / SUM(K) '', SUM(N) '', SUM(O) '', SUM(P) '', SUM(P) / SUM(N) ''")};
{"", "", "", "", "", "", "", "", "", ""};
{"BY WALLET AND CRYPTO", "", "", "", "", "", "", "", "", ""};
{QUERY(${referenceRangeName}, "SELECT J, G, ' ', SUM(K), SUM(N) / SUM(K), SUM(O) / SUM(K), SUM(N), SUM(O), SUM(P), SUM(P) / SUM(N) GROUP BY J, G ORDER BY J, G LABEL ' ' '', SUM(K) '',  SUM(N) / SUM(K) '', SUM(O) / SUM(K) '', SUM(N) '', SUM(O) '', SUM(P) '', SUM(P) / SUM(N) ''")};
{"", "", "", "", "", "", "", "", "", ""};
{"BY CRYPTO AND HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY(${referenceRangeName}, "SELECT ' ', G, R, SUM(K), SUM(N) / SUM(K), SUM(O) / SUM(K), SUM(N), SUM(O), SUM(P), SUM(P) / SUM(N) GROUP BY G, R ORDER BY G, R LABEL ' ' '', SUM(K) '',  SUM(N) / SUM(K) '', SUM(O) / SUM(K) '', SUM(N) '', SUM(O) '', SUM(P) '', SUM(P) / SUM(N) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY WALLET CRYPTO AND HOLDING PERIOD", "", "", "", "", "", "", "", "", ""};
QUERY(${referenceRangeName}, "SELECT J, G, R, SUM(K), SUM(N) / SUM(K), SUM(O) / SUM(K), SUM(N), SUM(O), SUM(P), SUM(P) / SUM(N) GROUP BY J, G, R ORDER BY J, G, R LABEL J '', SUM(K) '',  SUM(N) / SUM(K) '', SUM(O) / SUM(K) '', SUM(N) '', SUM(O) '', SUM(P) '', SUM(P) / SUM(N) ''")
})`, , , , , , , , , ,
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,QUERY(${referenceRangeName}, "SELECT G, SUM(O) GROUP BY G ORDER BY G LABEL SUM(O) ''"))`
  ]];

  sheet.getRange('A2:K2').setFormulas(formulas);

  sheet.hideColumns(11, 2);

  SpreadsheetApp.flush();

  this.trimColumns(sheet, 19);

  let pieChartBuilder = sheet.newChart().asPieChart();
  let chart = pieChartBuilder
    .addRange(sheet.getRange('K2:L1000'))
    .setNumHeaders(0)
    .setTitle('Value')
    .setPosition(1, 13, 30, 30)
    .build();

  sheet.insertChart(chart);

  sheet.autoResizeColumns(1, 14);

  SpreadsheetApp.flush();
}