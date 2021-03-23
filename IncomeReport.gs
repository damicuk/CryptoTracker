/**
 * Creates the income report if it doesn't already exist
 * Updates the sheet with the current income data
 * Trims the sheet to fit the data
 */
CryptoTracker.prototype.incomeReport = function () {

  const sheetName = this.incomeReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [
      [
        'Date Time',
        'Currency',
        'Ex Rate',
        'Amount',
        'Wallet',
        'Income Value'
      ]
    ];

    sheet.getRange('A1:F1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B2:B').setNumberFormat('@');
    sheet.getRange('C2:C').setNumberFormat('#,##0.00000;(#,##0.00000);');
    sheet.getRange('D2:D').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('E2:E').setNumberFormat('@');
    sheet.getRange('F2:F').setNumberFormat('#,##0.00;(#,##0.00)');

    const formulas = [[
      `IFERROR(ArrayFormula(FILTER(D2:D*C2:C, LEN(A2:A))),)`
    ]];

    sheet.getRange('F2:F2').setFormulas(formulas);

    let protection = sheet.protect().setDescription('Essential Data Sheet');
    protection.setWarningOnly(true);

  }

  let dataTable = this.getIncomeTable();

  this.writeTable(ss, sheet, dataTable, 'Income', 1, 5, 1);

}


/**
 * Returns a table of the current income data
 * The income data is collected when the ledger is processed
 * @return {*[][]} The current income data
 */
CryptoTracker.prototype.getIncomeTable = function () {

  let table = [];

  for (let lot of this.incomeLots) {

    let date = lot.date;
    let currency = lot.debitCurrency;
    let exRate = lot.debitExRate;
    let amount = lot.debitAmountSatoshi / 1e8;
    let wallet = lot.walletName;

    table.push([

      date,
      currency,
      exRate,
      amount,
      wallet
    ]);
  }

  return this.sortTable(table, 0);
}
