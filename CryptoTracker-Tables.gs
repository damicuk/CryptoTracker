CryptoTracker.prototype.getOpenPositionsTable = function () {

  let table = [[
    'Date Buy',
    'Debit Currency',
    'Debit ExRate',
    'Debit Amount',
    'Debit Fee',
    'Wallet Buy',

    'Credit Currency',
    'Credit Amount',
    'Credit Fee',

    'Wallet Current'
  ]];

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

CryptoTracker.prototype.getClosedPositionsTable = function () {

  let table = [[
    'Date Buy',
    'Debit Currency Buy',
    'Debit ExRate Buy',
    'Debit Amount Buy',
    'Debit Fee Buy',
    'Wallet Buy',

    'Credit Currency Buy',
    'Credit Amount Buy',
    'Credit Fee Buy',

    'Date Sell',
    'Credit Currency Sell',
    'Credit ExRate Sell',
    'Credit Amount Sell',
    'Credit Fee Sell',
    'Wallet Sell'
  ]];

  for (let closedLot of this.closedLots) {

    let lot = closedLot.lot;

    let dateBuy = lot.date;
    let debitCurrencyBuy = lot.debitCurrency;
    let debitExRateBuy = lot.debitExRate;
    let debitAmountBuy = lot.debitAmountSatoshi / 1e8;
    let debitFeeBuy = lot.debitFeeSatoshi / 1e8;
    let walletBuy = lot.walletName;

    let creditCurrencyBuy = lot.creditCurrency;
    let creditAmountBuy = lot.creditAmountSatoshi / 1e8;
    let creditFeeBuy = lot.creditFeeSatoshi / 1e8;

    let dateSell = closedLot.date;
    let creditCurrencySell = closedLot.creditCurrency;
    let creditExRateSell = closedLot.creditExRate;
    let creditAmountSell = closedLot.creditAmountSatoshi / 1e8;
    let creditFeeSell = closedLot.creditFeeSatoshi / 1e8;
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
}

CryptoTracker.prototype.getIncomeTable = function () {

  let table = [[
    'Date',
    'Currency',
    'ExRate',
    'Amount',
    'Wallet'
  ]];

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

CryptoTracker.prototype.getDonationsTable = function () {

  let table = [[
    'Date Buy',
    'Debit Currency Buy',
    'Debit ExRate Buy',
    'Debit Amount Buy',
    'Debit Fee Buy',
    'Wallet Buy',

    'Credit Currency Buy',
    'Credit Amount Buy',
    'Credit Fee Buy',

    'Date Donation',
    'ExRate Donation',
    'Wallet Donation'
  ]];

  for (let donatedLot of this.donatedLots) {

    let lot = donatedLot.lot;

    let dateBuy = lot.date;
    let debitCurrencyBuy = lot.debitCurrency;
    let debitExRateBuy = lot.debitExRate;
    let debitAmountBuy = lot.debitAmountSatoshi / 1e8;
    let debitFeeBuy = lot.debitFeeSatoshi / 1e8;
    let walletBuy = lot.walletName;

    let creditCurrencyBuy = lot.creditCurrency;
    let creditAmountBuy = lot.creditAmountSatoshi / 1e8;
    let creditFeeBuy = lot.creditFeeSatoshi / 1e8;

    let dateDonation = donatedLot.date;
    let exRateDonation = donatedLot.exRate;
    let walletDonation = donatedLot.walletName;

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

      dateDonation,
      exRateDonation,
      walletDonation
    ]);
  }

  return this.sortTable(table, 9);
}

CryptoTracker.prototype.getFiatTable = function () {

  let table = [['Wallet', 'Currency', 'Balance']];

  for (let wallet of this.wallets) {
    for (let fiatAccount of wallet.fiatAccounts) {
      table.push([wallet.name, fiatAccount.fiat, fiatAccount.balance])
    }
  }

  return this.sortTable(table, 0);
}

CryptoTracker.prototype.sortTable = function (table, index) {

  table.sort(function (a, b) {
    return a[index] - b[index];
  });

  return table;
}

CryptoTracker.prototype.dumpData = function (dataTable, sheetName, headerRows = 1) {

  const dataRows = dataTable.length;

  if (dataRows == 0) {
    return;
  }

  let sheet = this.getSheet(sheetName);

  sheet.clear();
  sheet.hideSheet();

  let protection = sheet.protect().setDescription('Essential Data Sheet');
  protection.setWarningOnly(true);

  const dataColumns = dataTable[0].length;

  //keep at least header and one row for arrayformula references
  const neededRows = Math.max(dataRows, headerRows + 1);

  //Trim the sheet to fit the data
  this.trimSheet(sheet, neededRows, dataColumns);

  //write the fresh data
  let dataRange = sheet.getRange(1, 1, dataRows, dataColumns);
  dataRange.setValues(dataTable);

  SpreadsheetApp.flush();
  
  sheet.autoResizeColumns(1, sheet.getDataRange().getWidth());

}