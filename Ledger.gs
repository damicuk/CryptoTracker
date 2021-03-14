CryptoTracker.prototype.updateLedgerCurrencies = function () {

  const sheetName = this.ledgerSheetName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return;
  }

  let fiats = Array.from(this.fiats);
  let cryptos = Array.from(this.cryptos);
  let currencies = fiats.concat(cryptos);

  this.addCurrencyValidation(sheet, 'C3:C', currencies);
  this.addCurrencyValidation(sheet, 'H3:H', currencies);

}

CryptoTracker.prototype.updateLedgerWallets = function () {

  const sheetName = this.ledgerSheetName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return;
  }

  let walletNames = [];
  for (walletName of this.walletNames) {
    walletNames.push(walletName);
  }
  walletNames.sort(function (a, b) {
    return a > b ? 1 : b > a ? -1 : 0;
  });

  this.addWalletValidation(sheet, 'G3:G', walletNames);
  this.addWalletValidation(sheet, 'L3:L', walletNames);

}
