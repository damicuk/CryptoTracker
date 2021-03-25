/**
 * Creates the open positions report if it doesn't already exist
 * Updates the sheet with the current open positions data
 * Trims the sheet to fit the data
 */
CryptoTracker.prototype.openPositionsReport = function () {

  const sheetName = this.openPositionsReportName;
  const exRatesRangeName = this.exRatesRangeName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [
      [
        'Buy Debit', , , , , ,
        'Buy Credit', , ,
        'Current',
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

    sheet.getRange('A1:R2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(2);

    sheet.getRange('A1:F2').setBackgroundColor('#ead1dc');
    sheet.getRange('G1:I2').setBackgroundColor('#d0e0e3');
    sheet.getRange('J1:J2').setBackgroundColor('#d9d2e9');
    sheet.getRange('K1:R2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:F1').mergeAcross();
    sheet.getRange('G1:I1').mergeAcross();
    sheet.getRange('K1:R1').mergeAcross();

    sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B3:B').setNumberFormat('@');
    sheet.getRange('C3:C').setNumberFormat('#,##0.00000;(#,##0.00000);');
    sheet.getRange('D3:D').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('E3:E').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('F3:G').setNumberFormat('@');
    sheet.getRange('H3:H').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('I3:I').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('J3:J').setNumberFormat('@');
    sheet.getRange('K3:K').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('L3:O').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('P3:P').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange('Q3:Q').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
    sheet.getRange('R3:R').setNumberFormat('@');

    sheet.clearConditionalFormatRules();
    this.addLongShortCondition(sheet, 'R3:R');

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(H3:H-I3:I, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(K3:K=0,,N3:N/K3:K), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,ArrayFormula(FILTER(IFNA(VLOOKUP(G3:G, QUERY(${exRatesRangeName}, "SELECT B, D"), 2, FALSE),), LEN(A3:A))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(C3:C, (D3:D+E3:E)*C3:C, D3:D+E3:E), LEN(A3:A)))))`,
      `ArrayFormula(IF(ISBLANK(M3:M),,FILTER(K3:K*M3:M, LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(M3:M),,FILTER(O3:O-N3:N, LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(M3:M),,FILTER(IF(N3:N=0,,P3:P/N3:N), LEN(A3:A))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF((DATEDIF(A3:A, NOW(), "Y") > 1)+(((DATEDIF(A3:A, NOW(), "Y") = 1)*(DATEDIF(A3:A, NOW(), "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A)))))`
    ]];

    sheet.getRange('K3:R3').setFormulas(formulas);

    let protection = sheet.protect().setDescription('Essential Data Sheet');
    protection.setWarningOnly(true);

  }

  let dataTable = this.getOpenPositionsTable();

  this.writeTable(ss, sheet, dataTable, this.openPositionsRangeName, 2, 10, 8);

}

/**
 * Returns a table of the current open positions data
 * The open positions data is collected when the ledger is processed
 * @return {*[][]} The current open positions data
 */
CryptoTracker.prototype.getOpenPositionsTable = function () {

  let table = [];

  for (let wallet of this.wallets) {
    for (let cryptoAccount of wallet.cryptoAccounts) {

      for (let lot of cryptoAccount.lots) {

        let date = lot.date;
        let debitCurrency = lot.debitCurrency;
        let debitExRate = lot.debitExRate;
        let debitAmount = lot.debitAmountSatoshi / 1e8;
        let debitFee = lot.debitFeeSatoshi / 1e8;
        let buyWallet = lot.walletName;

        let creditCurrency = lot.creditCurrency;
        let creditAmount = lot.creditAmountSatoshi / 1e8;
        let creditFee = lot.creditFeeSatoshi / 1e8;

        let currentWallet = wallet.name;

        table.push([

          date,
          debitCurrency,
          debitExRate,
          debitAmount,
          debitFee,
          buyWallet,

          creditCurrency,
          creditAmount,
          creditFee,

          currentWallet
        ]);
      }
    }
  }

  return this.sortTable(table, 0);
}
