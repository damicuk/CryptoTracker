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
  sheet.getRange('C3:C21').setDataValidation(currencyRule);
  sheet.getRange('H3:H21').setDataValidation(currencyRule);
  
}
