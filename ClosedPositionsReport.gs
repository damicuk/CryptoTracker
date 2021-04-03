/**
 * Creates the closed positions report if it doesn't already exist.
 * Updates the sheet with the current closed positions data.
 * Trims the sheet to fit the data.
 */
CryptoTracker.prototype.closedPositionsReport = function () {

  const sheetName = this.closedPositionsReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

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
        'Sell Price',
        'Cost Basis',
        'Proceeds',
        'Realized P/L',
        'Realized P/L %',
        'Holding Period'
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

    sheet.clearConditionalFormatRules();
    this.addLongShortCondition(sheet, 'W3:W');

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(H3:H-I3:I, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(P3:P=0,,S3:S/P3:P), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(P3:P=0,,T3:T/P3:P), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(C3:C, (D3:D+E3:E)*C3:C, D3:D+E3:E), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(L3:L, (M3:M-N3:N)*L3:L, M3:M-N3:N), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(T3:T-S3:S, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(S3:S=0,,U3:U/S3:S), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF((DATEDIF(A3:A, J3:J, "Y") > 1)+(((DATEDIF(A3:A, J3:J, "Y") = 1)*(DATEDIF(A3:A, J3:J, "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A)))))`
    ]];

    sheet.getRange('P3:W3').setFormulas(formulas);

    let protection = sheet.protect().setDescription('Essential Data Sheet');
    protection.setWarningOnly(true);

  }

  let dataTable = this.getClosedPositionsTable();

  this.writeTable(ss, sheet, dataTable, this.closedPositionsRangeName, 2, 15, 8);

};

/**
 * Returns a table of the current closed positions data.
 * The closed positions data is collected when the ledger is processed.
 * @return {Array<Array>} The current closed positions data.
 */
CryptoTracker.prototype.getClosedPositionsTable = function () {

  let table = [];

  for (let closedLot of this.closedLots) {

    let lot = closedLot.lot;

    let dateBuy = lot.date;
    let debitCurrencyBuy = lot.debitCurrency;
    let debitExRateBuy = lot.debitExRate;
    let debitAmountBuy = lot.debitAmount;
    let debitFeeBuy = lot.debitFee;
    let walletBuy = lot.walletName;

    let creditCurrencyBuy = lot.creditCurrency;
    let creditAmountBuy = lot.creditAmount;
    let creditFeeBuy = lot.creditFee;

    let dateSell = closedLot.date;
    let creditCurrencySell = closedLot.creditCurrency;
    let creditExRateSell = closedLot.creditExRate;
    let creditAmountSell = closedLot.creditAmount;
    let creditFeeSell = closedLot.creditFee;
    let walletSell = closedLot.walletName;

    table.push([

      dateBuy,
      debitCurrencyBuy,
      debitExRateBuy,
      debitAmountBuy,
      debitFeeBuy,
      walletBuy,

      creditCurrencyBuy,
      creditAmountBuy,
      creditFeeBuy,

      dateSell,
      creditCurrencySell,
      creditExRateSell,
      creditAmountSell,
      creditFeeSell,
      walletSell
    ]);
  }

  return this.sortTable(table, 9);
};

