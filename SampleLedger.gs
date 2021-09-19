/**
 * Creates a sample ledger sheet.
 * Renames any existing ledger sheet so as not to overwrite it.
 */
CryptoTracker.prototype.sampleLedger = function () {

  const sheetName = this.ledgerSheetName;

  this.renameSheet(sheetName);

  let ss = SpreadsheetApp.getActive();
  sheet = ss.insertSheet(sheetName);

  let headers = [
    [
      , ,
      'Debit', , , , ,
      'Credit', , , , , , ,
    ],
    [
      'Date Time',
      'Action',
      'Currency',
      'Ex Rate',
      'Amount',
      'Fee',
      'Wallet',
      'Currency',
      'Ex Rate',
      'Amount',
      'Fee',
      'Wallet',
      'Lot Matching',
      'Comment'
    ]
  ];

  sheet.getRange('A1:N2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(2);

  sheet.getRange('A1:B2').setBackgroundColor('#fce5cd');
  sheet.getRange('C1:G2').setBackgroundColor('#ead1dc');
  sheet.getRange('H1:L2').setBackgroundColor('#d0e0e3');
  sheet.getRange('M1:N2').setBackgroundColor('#c9daf8');

  sheet.getRange('A1:B1').mergeAcross();
  sheet.getRange('C1:G1').mergeAcross();
  sheet.getRange('H1:L1').mergeAcross();
  sheet.getRange('M1:N1').mergeAcross();

  sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('B3:C').setNumberFormat('@');
  sheet.getRange('D3:F').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('G3:H').setNumberFormat('@');
  sheet.getRange('I3:K').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('L3:N').setNumberFormat('@');

  sheet.clearConditionalFormatRules();
  this.addActionCondtion(sheet, 'B3:B');

  let actions = ['Donation', 'Fee', 'Gift', 'Income', 'Stop', 'Trade', 'Transfer'];

  let actionRule = SpreadsheetApp.newDataValidation().requireValueInList(actions).setAllowInvalid(false).build();
  sheet.getRange('B3:B').setDataValidation(actionRule);

  let currencies = [this.accountingCurrency, 'ADA', 'BTC'];

  this.addCurrencyValidation(sheet, 'C3:C', currencies);
  this.addCurrencyValidation(sheet, 'H3:H', currencies);

  let wallets = ['Binance', 'Deposit', 'Kraken', 'Ledger', 'Rewards', 'Yoroi'];

  this.addWalletValidation(sheet, 'G3:G', wallets);
  this.addWalletValidation(sheet, 'L3:L', wallets);

  let lotMatchings = ['FIFO', 'LIFO', 'HIFO', 'LOFO'];

  let lotMatchingRule = SpreadsheetApp.newDataValidation().requireValueInList(lotMatchings).setAllowInvalid(false).build();
  sheet.getRange('M3:M').setDataValidation(lotMatchingRule);

  if (!sheet.getFilter()) {
    sheet.getRange('A2:N').createFilter();
  }

  //To make prices in JPY approx those in other currencies
  let multiplier = 100 / Currency.subunits(this.accountingCurrency);

  let sampleData = [
    ['2019-03-01 12:00:00', 'Transfer', this.accountingCurrency, , 20000 * multiplier, , , , , , , 'Kraken', , `Leave debit wallet blank when transferring fiat from a bank account.`],
    ['2019-03-02 12:00:00', 'Trade', this.accountingCurrency, , 7990 * multiplier, 10 * multiplier, 'Kraken', 'BTC', , 2, , , , `Debit amount is debited and credit amount is credited but fees are always debited.`],
    ['2019-03-03 12:00:00', 'Trade', this.accountingCurrency, , 9990 * multiplier, 10 * multiplier, 'Kraken', 'BTC', , 2, , , , `Buy BTC.`],
    ['2019-03-04 12:00:00', 'Trade', 'BTC', , 1, , 'Kraken', this.accountingCurrency, , 6010 * multiplier, 10 * multiplier, , , `Sell BTC.`],
    ['2020-12-01 12:00:00', 'Trade', 'BTC', , 1, , 'Kraken', this.accountingCurrency, , 20010 * multiplier, 10 * multiplier, , 'LIFO', `Lot matching method applies to the current and following transactions (default in settings).`],
    ['2020-12-02 12:00:00', 'Trade', 'BTC', 20000, 1, , 'Kraken', 'ADA', 0.2, 100000, , , , `Exchange cryptos.`],
    ['2020-12-03 12:00:00', 'Trade', 'ADA', , 50000, , 'Kraken', this.accountingCurrency, , 12010 * multiplier, 10 * multiplier, , , ,],
    ['2020-12-04 12:00:00', 'Transfer', 'ADA', , 49999.4, 0.6, 'Kraken', , , , , 'Yoroi', , `Transfer amount and fee are always and only entered in the debit column.`],
    ['2020-12-05 12:00:00', 'Transfer', 'BTC', , 0.9995, 0.0005, 'Kraken', , , , , 'Ledger', , ,],
    ['2020-12-06 12:00:00', 'Transfer', this.accountingCurrency, , 30000 * multiplier, , 'Kraken', , , , , , , `Leave credit wallet blank when transferring fiat to a bank account.`],
    ['2021-02-01 12:00:00', 'Income', , , , , , 'ADA', 1, 10, , 'Rewards', , `Staking reward.`],
    ['2021-02-05 12:00:00', 'Income', , , , , , 'ADA', 1.3, 10, , 'Rewards', , ,],
    ['2021-03-01 12:00:00', 'Donation', 'ADA', 1.1, 500, , 'Yoroi', , , , , , , `Donations (e.g. to registered charities) are recorded in the donations report.`],
    ['2021-03-02 12:00:00', 'Donation', 'ADA', 1.1, 500, , 'Yoroi', , , , , , , ,],
    ['2021-03-03 12:00:00', 'Gift', 'ADA', , 500, , 'Yoroi', , , , , , , `Gifts (e.g. to friends or family) are not recorded. The asset simply disappears.`],
    ['2021-03-04 12:00:00', 'Fee', 'ADA', , , 0.17, 'Yoroi', , , , , , , `Miscellaneous fee.`]
  ];

  sheet.getRange('A3:N18').setValues(sampleData);

  this.trimSheet(sheet, 19, 14);

  sheet.autoResizeColumns(1, 1);
  sheet.autoResizeColumns(5, 1);
  sheet.autoResizeColumns(10, 1);
  sheet.autoResizeColumns(14, 1);

  return sheet;
};