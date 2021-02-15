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

  //total for each fiat
  table.push(['Total']);
  for (let fiat of this.fiats) {
    let balance = this.getFiatBalance(fiat);
    table[table.length - 1].push(balance);
  }

  return table;
}

// CryptoTracker.prototype.getCryptoTable = function () {

//   //fiat currency column headers
//   let table = [['Wallet'].concat(this.cryptos)];

//   //wallet name row headers and balances
//   for (let wallet of this.wallets) {
//     if (wallet.hasCryptoAccounts) {
//       table.push([wallet.name]);
//       for (let crypto of this.cryptos) {
//         let balance = wallet.getCryptoBalance(crypto);
//         table[table.length - 1].push(balance);
//       }
//     }
//   }

//   //total for each crypto
//   table.push(['Total']);
//   for (let crypto of this.cryptos) {
//     let balance = this.getCryptoBalance(crypto);
//     table[table.length - 1].push(balance);
//   }

//   return table;
// }

// CryptoTracker.prototype.getProfitTable = function () {

//   let table = [['Crypto', 'Quantity', 'Cost Price', 'Cost Basis', 'Current Price', 'Value', 'Unrealized P/L', 'Unrealized P/L %']];

//   let totalCostBasisCents = 0;
//   for (let crypto of this.cryptos) {

//     let balance = this.getCryptoBalance(crypto);

//     if (balance) {

//       let costBasisCents = this.getCostBasisCents(crypto);
//       let costBasis = costBasisCents / 100;
//       let costPrice = Math.round(costBasisCents / balance) / 100;

//       totalCostBasisCents += costBasisCents;

//       table.push([crypto,
//         balance,
//         costPrice,
//         costBasis,
//         '',
//         '',
//         '',
//         '']);

//     }
//   }

//   let totalCostBasis = totalCostBasisCents / 100;

//   table.push(['Total',
//     '',
//     '',
//     totalCostBasis,
//     '',
//     '',
//     '',
//     '']);

//   return table;
// }

// CryptoTracker.prototype.getClosedSummaryTable = function () {

//   let table = [['Crypto',
//     'Quantity',
//     'Av. Cost Price',
//     'Cost Basis',
//     'Av. Sell Price',
//     'Proceeds',
//     'Realized P/L',
//     'Realized P/L %']];


//   let totalCostBasisCents = 0;
//   let totalProceedsCent = 0;
//   for (let crypto of this.cryptos) {

//     let satoshi = 0;
//     let costBasisCents = 0;
//     let proceedsCents = 0;

//     for (let closedLot of this.closedLots) {

//       let lot = closedLot.lot;
//       if (lot.creditCurrency == crypto) {

//         satoshi += lot.satoshi;
//         costBasisCents += lot.costBasisCents;
//         proceedsCents += closedLot.proceedsCents;

//       }
//     }

//     let amount = satoshi / 1e8;

//     if (amount) {

//       let costBasis = costBasisCents / 100;
//       let proceeds = proceedsCents / 100;
//       let costPrice = Math.round(costBasisCents / amount) / 100;
//       let sellPrice = Math.round(proceedsCents / amount) / 100;
//       let profit = (proceedsCents - costBasisCents) / 100;
//       let percentProfit = Math.round((proceedsCents - costBasisCents) * 100 / costBasisCents) / 100;

//       totalCostBasisCents += costBasisCents;
//       totalProceedsCent += proceedsCents;

//       table.push([crypto,
//         amount,
//         costPrice,
//         costBasis,
//         sellPrice,
//         proceeds,
//         profit,
//         percentProfit]);

//     }
//   }

//   let totalCostBasis = totalCostBasisCents / 100;
//   let totalProceeds = totalProceedsCent / 100;
//   let totalProfit = (totalProceedsCent - totalCostBasisCents) / 100;
//   let totalPercentProfit = Math.round((totalProceedsCent - totalCostBasisCents) * 100 / totalCostBasisCents) / 100;

//   table.push(['Total',
//     '',
//     '',
//     totalCostBasis,
//     '',
//     totalProceeds,
//     totalProfit,
//     totalPercentProfit]);

//   return table;
// }

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

