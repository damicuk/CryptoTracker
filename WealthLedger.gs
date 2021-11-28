/**
 * Used to upgrade to WealthLedger
 * Show a confirmation dialog.
 * Validates and processes the ledger.
 * Deletes the report sheets.
 * Creates an instructions sheet.
 * Creates a WealthLedger assets sheet.
 * Creates a WealthLedger ledger sheet.
 * Sets the currenct cell to A1 in the instructions sheet.
 * Displays toast on success.
 */
CryptoTracker.prototype.createWealthLedger = function () {

  let ui = SpreadsheetApp.getUi();
  let message = `WealthLedger is a more powerful version of this application.\nIt is still entirely free. The upgrade is fully reversable.\n\nDo you want to continue?`;
  let result = ui.alert(`Please confirm`, message, ui.ButtonSet.YES_NO);
  if (result !== ui.Button.YES) {
    SpreadsheetApp.getActive().toast('Upgrade canceled');
    return;
  }

  let ledgerRecords;
  try {
    ledgerRecords = this.getLedgerRecords();
    this.validateLedgerRecords(ledgerRecords);
  }
  catch (error) {
    if (error instanceof ValidationError) {
      this.handleError('validation', error.message, error.rowIndex, error.columnName);
      return;
    }
    else {
      throw error;
    }
  }

  try {
    this.processLedger(ledgerRecords);
  }
  catch (error) {
    if (error instanceof CryptoAccountError) {
      this.handleError('cryptoAccount', error.message, error.rowIndex, 'debitAmount');
      return;
    }
    else {
      throw error;
    }
  }

  this.deleteReports();

  let instructionsSheet = this.instructionsSheet();
  this.assetsSheet();
  this.wealthLedgerSheet(ledgerRecords);

  SpreadsheetApp.getActive().setCurrentCell(instructionsSheet.getRange('A1'));

  SpreadsheetApp.getActive().toast('Follow the instuctions.', 'Upgrade complete');
}

/**
 * Creates an instructions sheet.
 * Includes the API key if there is one.
 */
CryptoTracker.prototype.instructionsSheet = function () {

  const sheetName = 'Instructions';

  this.renameSheet(sheetName);

  let ss = SpreadsheetApp.getActive();
  sheet = ss.insertSheet(sheetName);

  let dataTable = [
    [`1. Uninstall CryptoTracker (Extensions - Add-ons - Manage Add-ons).`],
    [``],
    [`2. Install WealthLedger (Extensions - Add-ons - Get Add-ons).`],
    [``],
    [`3. Copy the following CryptoCompare API key into WealthLedger settings.`],
    [``],
    [this.apiKey ? this.apiKey : 'No API key found.'],
    [``],
    [`4. Delete this sheet.`],
    [``],
    [`5. When you are happy with the upgrade you can delete the old ledger sheet (now renamed Ledger + some number).`]
  ];

  let range = sheet.getRange(1, 1, dataTable.length, 1);
  range.setValues(dataTable);
  range.setFontWeight('bold');

  return sheet;
};

/**
 * Creates a WealthLedger assets sheet.
 * Renames any existing assets sheet so as not to overwrite it.
 */
CryptoTracker.prototype.assetsSheet = function () {

  const sheetName = 'Assets';

  this.renameSheet(sheetName);

  let ss = SpreadsheetApp.getActive();
  sheet = ss.insertSheet(sheetName);

  let headers = [
    [
      'Asset',
      'Asset Type',
      'Decimal Places',
      'Current Price',
      'API',
      'Timestamp',
      'Comment'
    ]
  ];

  sheet.getRange('A1:G1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:B').setNumberFormat('@');
  sheet.getRange('C2:C').setNumberFormat('0');
  sheet.getRange('D2:D').setNumberFormat('#,##0.0000;(#,##0.0000)');
  sheet.getRange('E2:E').setNumberFormat('@');
  sheet.getRange('F2:F').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('G2:G').setNumberFormat('@');

  let dataTable = [];

  dataTable.push([this.accountingCurrency, 'Fiat Base', Currency.decimalDigits(this.accountingCurrency), '1', , , 'Every asset in the ledger sheet must have an entry in the assets sheet.']);

  let rowIndex = 3;

  let fiats = Array.from(this.fiats).sort(CryptoTracker.abcComparator);

  for (let fiat of fiats) {
    if (fiat !== this.accountingCurrency) {
      dataTable.push([fiat, 'Fiat', Currency.decimalDigits(fiat), `=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A${rowIndex}), "${this.accountingCurrency}"))`, , , ,]);
      rowIndex++;
    }
  }

  let cryptos = Array.from(this.cryptos).sort(CryptoTracker.abcComparator);
  let currentCryptos = this.currentCryptos;
  let googleFinanceSet = new Set(['BTC', 'BNB', 'ETH', 'ADA', 'XRP']);
  let assetType = 'Crypto'
  let stablecoinSet = new Set(['BUSD', 'cUSD', 'DAI', 'EURS', 'EURX', 'FEI', 'FRAX', 'GUSD', 'HUSD', 'LUSD', 'MUSD', 'sUSD', 'TUSD', 'USDC', 'USDN', 'USDP', 'USDT', 'UST']);

  for (let crypto of cryptos) {
    if (currentCryptos.has(crypto)) {
      if (stablecoinSet.has(crypto)) {
        assetType = 'Stablecoin';
      }
      if (googleFinanceSet.has(crypto)) {
        dataTable.push([crypto, assetType, Currency.decimalDigits(crypto), `=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A${rowIndex}), "${this.accountingCurrency}"))`, , , ,]);
      }
      else if (crypto === 'EURX') {
        if (this.accountingCurrency == 'EUR') {
          dataTable.push([crypto, assetType, Currency.decimalDigits(crypto), '1', , , ,]);
        }
        else {
          dataTable.push([crypto, assetType, Currency.decimalDigits(crypto), `=GOOGLEFINANCE(CONCAT("CURRENCY:EUR", "${this.accountingCurrency}"))`, , , ,]);
        }
      }
      else if (this.apiKey !== '') {
        dataTable.push([crypto, assetType, Currency.decimalDigits(crypto), , 'CryptoCompare', , ,]);
      }
      else {
        dataTable.push([crypto, assetType, Currency.decimalDigits(crypto), , , , ,]);
      }
    }
    else {
      dataTable.push([crypto, assetType, Currency.decimalDigits(crypto), , , , ,]);
    }
    rowIndex++;
  }

  dataTable.push([, , , , , , ,]);

  this.cmcApiName = 'CoinMarketCap';
  this.ccApiName = 'CryptoCompare';

  this.validApiNames = [this.cmcApiName, this.ccApiName,];

  sheet.getRange(2, 1, dataTable.length, 7).setValues(dataTable);

  let assetRule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied(`=REGEXMATCH(TO_TEXT(A2), "^(\\w{1,15}:)?[\\w$@]{1,10}$")`)
    .setAllowInvalid(false)
    .setHelpText(`Input must be 1-10 characters [A-Za-z0-9_$@] with optional prefix of 1-15 characters [A-Za-z0-9_] and colon [:].`)
    .build();
  sheet.getRange('A2:A').setDataValidation(assetRule);

  let assetTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(Asset.defaultAssetTypes)
    .setAllowInvalid(true)
    .setHelpText(`New asset types will be added to the data validation dropdown when write reports is run.`)
    .build();
  sheet.getRange('B2:B').setDataValidation(assetTypeRule);

  let decimalPlacesRule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied(`=REGEXMATCH(TO_TEXT(C2), "^[012345678]{1}$")`)
    .setAllowInvalid(false)
    .setHelpText(`Input must be an integer between 0 and 8.`)
    .build();
  sheet.getRange('C2:C').setDataValidation(decimalPlacesRule);

  let apiRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(this.validApiNames)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('E2:E').setDataValidation(apiRule);

  if (!sheet.getFilter()) {
    sheet.getRange('A1:G').createFilter();
  }

  this.trimSheet(sheet, dataTable.length + 1, 7);

  sheet.setColumnWidths(1, 5, 140);
  sheet.setColumnWidth(6, 170);
  sheet.autoResizeColumns(7, 1);

  return sheet;
};

/**
 * Creates a WealthLedger ledger sheet.
 * Renames any existing ledger sheet so as not to overwrite it.
 * @param {LedgerRecord[]} ledgerRecords - The collection of ledger records.
 */
CryptoTracker.prototype.wealthLedgerSheet = function (ledgerRecords) {

  this.addDefaultLotMatching(ledgerRecords);
  let comments = this.getLedgerComments();

  const sheetName = 'Ledger';

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
      'Asset',
      'Ex Rate',
      'Amount',
      'Fee',
      'Wallet',
      'Asset',
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

  this.addActionCondtion(sheet, 'B3:B');

  if (!sheet.getFilter()) {
    sheet.getRange('A2:N').createFilter();
  }

  let dataTable = [];

  let index = 0;

  for (let ledgerRecord of ledgerRecords) {

    let comment = '';
    if (comments) {
      comment = comments[index++][0];
    }

    dataTable.push([
      ledgerRecord.date,
      ledgerRecord.action,
      ledgerRecord.debitCurrency,
      ledgerRecord.debitExRate,
      ledgerRecord.debitAmount,
      ledgerRecord.debitFee,
      ledgerRecord.debitWalletName,
      ledgerRecord.creditCurrency,
      ledgerRecord.creditExRate,
      ledgerRecord.creditAmount,
      ledgerRecord.creditFee,
      ledgerRecord.creditWalletName,
      ledgerRecord.lotMatching,
      comment
    ]);
  }

  let fiatTickers = Array.from(this.fiats).sort(CryptoTracker.abcComparator);
  let assetTickers = Array.from(this.cryptos).sort(CryptoTracker.abcComparator);
  let assetList = fiatTickers.concat(assetTickers);

  let walletNames = [];
  for (let wallet of this.wallets) {
    walletNames.push(wallet.name);
  }
  walletNames.sort(CryptoTracker.abcComparator);

  sheet.getRange(3, 1, dataTable.length, 14).setValues(dataTable);

  let dateRule = SpreadsheetApp.newDataValidation()
    .requireDate()
    .setAllowInvalid(false)
    .setHelpText('Input must be a date.')
    .build();
  sheet.getRange('A3:A').setDataValidation(dateRule);

  let actionRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Donation', 'Fee', 'Gift', 'Income', 'Skip', 'Split', 'Stop', 'Trade', 'Transfer'])
    .setAllowInvalid(false)
    .build();
  sheet.getRange('B3:B').setDataValidation(actionRule);

  let assetRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(assetList)
    .setAllowInvalid(true)
    .setHelpText(`New assets will be added to the data validation dropdown when write reports is run.`)
    .build();
  sheet.getRange('C3:C').setDataValidation(assetRule);
  sheet.getRange('H3:H').setDataValidation(assetRule);

  let positiveNumberRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThan(0)
    .setAllowInvalid(false)
    .setHelpText(`Input must be a number greater than 0.`)
    .build();
  sheet.getRange('D3:D').setDataValidation(positiveNumberRule);
  sheet.getRange('I3:I').setDataValidation(positiveNumberRule);

  let nonNegativeNumberRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThanOrEqualTo(0)
    .setAllowInvalid(false)
    .setHelpText(`Input must be a number greater than or equal to 0.`)
    .build();
  sheet.getRange('E3:E').setDataValidation(nonNegativeNumberRule);
  sheet.getRange('F3:F').setDataValidation(nonNegativeNumberRule);
  sheet.getRange('J3:J').setDataValidation(nonNegativeNumberRule);
  sheet.getRange('K3:K').setDataValidation(nonNegativeNumberRule);

  let walletRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(walletNames)
    .setAllowInvalid(true)
    .setHelpText(`New wallets will be added to the data validation dropdown when write reports is run.`)
    .build();
  sheet.getRange('G3:G').setDataValidation(walletRule);
  sheet.getRange('L3:L').setDataValidation(walletRule);

  let lotMatchingRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['FIFO', 'LIFO', 'HIFO', 'LOFO'])
    .setAllowInvalid(false)
    .build();
  sheet.getRange('M3:M').setDataValidation(lotMatchingRule);

  this.trimSheet(sheet, dataTable.length + 2, 14);

  sheet.autoResizeColumns(1, 1);
  sheet.autoResizeColumns(5, 1);
  sheet.autoResizeColumns(10, 1);
  sheet.setColumnWidth(13, 120);
  sheet.autoResizeColumns(14, 1);

  return sheet;
};

/**
 * Reads and returns the comments from the ledger sheet
 * @return {Array<Array<string>>} The data table containing the comments.
 */
CryptoTracker.prototype.getLedgerComments = function () {


  let ss = SpreadsheetApp.getActive();
  let ledgerSheet = ss.getSheetByName(this.ledgerSheetName);

  if (ledgerSheet.getMaxColumns() < 14) {
    return null;
  }

  let commentsRange = ledgerSheet.getRange('N3:N');
  let comments = commentsRange.getValues();

  return comments;
};

/**
 * Adds lot matching to the first ledger record if not already set and if the default lot matching is not FIFO.
 * @param {LedgerRecord[]} ledgerRecords - The collection of ledger records.
 */
CryptoTracker.prototype.addDefaultLotMatching = function (ledgerRecords) {

  if (this.defaultLotMatching === 'FIFO') {
    return;
  }

  let firstLedgerRecord;

  if (LedgerRecord.inReverseOrder(ledgerRecords)) {

    firstLedgerRecord = ledgerRecords[ledgerRecords.length - 1];

  }
  else {

    firstLedgerRecord = ledgerRecords[0];

  }

  if (firstLedgerRecord.lotMatching === '') {

    firstLedgerRecord.lotMatching = this.defaultLotMatching;

  }
};

/**
 * Adds specific conditional text color formatting to a range of cells in a sheet.
 * Used to format the action column of the ledger sheet.
 * @param {Sheet} sheet - The sheet containing the range of cells to format.
 * @param {string} a1Notation - The A1 notation used to specify the range of cells to be formatted.
 */
CryptoTracker.prototype.addActionCondtion = function (sheet, a1Notation) {

  let textColors = [
    ['Donation', '#ff9900', null],
    ['Fee', '#9900ff', null],
    ['Gift', '#ff9900', null],
    ['Income', '#6aa84f', null],
    ['Skip', '#ff0000', '#ffbb00'],
    ['Split', '#ff00ff', null],
    ['Stop', '#ff0000', '#ffbb00'],
    ['Trade', '#1155cc', null],
    ['Transfer', '#ff0000', null],
  ];

  let range = sheet.getRange(a1Notation);
  let rules = sheet.getConditionalFormatRules();

  for (let textColor of textColors) {

    let rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(textColor[0])
      .setFontColor(textColor[1])
      .setBackground(textColor[2])
      .setRanges([range])
      .build();

    rules.push(rule);
  }

  sheet.setConditionalFormatRules(rules);
};