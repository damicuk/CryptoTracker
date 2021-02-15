CryptoTracker.prototype.getFiatTable = function () {

  //fiat currency column headers
  let table = [['Wallet'].concat(this.fiats)];

  //wallet name row headers and balances
  for (let wallet of this.wallets) {
    if (wallet.hasFiatAccounts) {
      table.push([wallet.name]);
      for (let fiat of this.fiats) {
        let balance = wallet.getFiatBalance(fiat);
        table[table.length - 1].push(balance);
      }
    }
  }
  
  return table;
}

CryptoTracker.prototype.getOpenPositionsTable = function () {

  let table = [];

  table.push([

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
  ]);

  for (let wallet of this.wallets) {
    for (let cryptoAccount of wallet.cryptoAccounts) {

      for (let lot of cryptoAccount.lots) {

        let creditCurrency = lot.creditCurrency;
        let creditAmount = lot.creditAmountSatoshi / 1e8;
        let creditFee = lot.creditFeeSatoshi / 1e8;

        let date = lot.date;
        let debitCurrency = lot.debitCurrency;
        let debitAmount = lot.debitAmountSatoshi / 1e8;
        let debitFee = lot.debitFeeSatoshi / 1e8;
        let debitExRate = lot.debitExRate;
        let buyWallet = lot.walletName;
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

  //sort by date
  const dateIndex = 0;
  table.sort(function (a, b) {
    return a[dateIndex] - b[dateIndex];
  });

  return table;
}

CryptoTracker.prototype.getClosedPositionsTable = function () {

  let table = [];

  table.push([

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
  ]);

  for (let closedLot of this.closedLots) {

    let lot = closedLot.lot;

    let dateBuy = lot.date;
    let debitCurrencyBuy = lot.debitCurrency;
    let debitAmountBuy = lot.debitAmountSatoshi / 1e8;
    let debitFeeBuy = lot.debitFeeSatoshi / 1e8;
    let debitExRateBuy = lot.debitExRate;
    let walletBuy = lot.walletName;

    let creditCurrencyBuy = lot.creditCurrency;
    let creditAmountBuy = lot.creditAmountSatoshi / 1e8;
    let creditFeeBuy = lot.creditFeeSatoshi / 1e8;

    let dateSell = closedLot.date;
    let creditCurrencySell = closedLot.creditCurrency;
    let creditAmountSell = closedLot.creditAmountSatoshi / 1e8;
    let creditFeeSell = closedLot.creditFeeSatoshi / 1e8;
    let creditExRateSell = closedLot.creditExRate;
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

  //sort by sell date
  const dateSellIndex = 9;
  table.sort(function (a, b) {
    return a[dateSellIndex] - b[dateSellIndex];
  });

  return table;
}

CryptoTracker.prototype.dumpData = function (dataTable, sheetName) {

  const dataRows = dataTable.length;
  if (dataTable.length > 0) {

    ss = SpreadsheetApp.getActive();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    sheet.clear();

    const dataColumns = dataTable[0].length;

    //Trim the sheet to fit the data
    const totalColumns = sheet.getMaxColumns();
    const totalRows = sheet.getMaxRows();

    //keep at least header and one row for arrayformula references
    const neededRows = Math.max(dataRows, 2);

    const extraColumns = totalColumns - dataColumns;
    const extraRows = totalRows - neededRows;

    if (extraColumns > 0) {
      sheet.deleteColumns(dataColumns + 1, extraColumns);
    }
    else if (extraColumns < 0) {
      sheet.insertColumnsAfter(totalColumns, -extraColumns);
    }

    if (extraRows > 0) {
      sheet.deleteRows(dataRows + 1, extraRows);
    }
    else if (extraRows < 0) {
      sheet.insertRowsAfter(totalRows, -extraRows);
    }

    //write the fresh data
    let dataRange = sheet.getRange(1, 1, dataRows, dataColumns);
    dataRange.setValues(dataTable);

    sheet.autoResizeColumns(1, sheet.getDataRange().getWidth());
  }
}

