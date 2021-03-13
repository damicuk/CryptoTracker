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

  let currencyRule = SpreadsheetApp.newDataValidation().requireValueInList(currencies).build();
  sheet.getRange('C3:C').setDataValidation(currencyRule);
  sheet.getRange('H3:H').setDataValidation(currencyRule);

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

  let walletRule = SpreadsheetApp.newDataValidation().requireValueInList(walletNames).build();
  sheet.getRange('G3:G').setDataValidation(walletRule);
  sheet.getRange('L3:L').setDataValidation(walletRule);

}
