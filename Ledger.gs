/**
 * Returns the range in the ledger sheet that contains the data excluding header rows
 * If there is no ledger sheet it creates a sample ledger and returns the range from that
 * @return {Range} The range in the ledger sheet that contains the data excluding header rows
 */
CryptoTracker.prototype.getLedgerRange = function () {

  let ss = SpreadsheetApp.getActive();
  let ledgerSheet = ss.getSheetByName(this.ledgerSheetName);

  if (!ledgerSheet) {
    
    ledgerSheet = this.sampleLedger();
  }

  let ledgerRange = ledgerSheet.getDataRange();
  ledgerRange = ledgerRange.offset(2, 0, ledgerRange.getHeight() - 2, 13);

  return ledgerRange;
}

/**
 * Sets data validation on the currency columns in the ledger sheet 
 * The list of fiat and cryptocurrency tickers is collected when the ledger is processed to write the reports
 * Both fiat and cryptocurrencies are sorted alphabetically
 * The fiat currencies are listed before the cryptocurrencies
 */
CryptoTracker.prototype.updateLedgerCurrencies = function () {

  const sheetName = this.ledgerSheetName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return;
  }

  let fiats = Array.from(this.fiats).sort(CryptoTracker.abcComparator);
  let cryptos = Array.from(this.cryptos).sort(CryptoTracker.abcComparator);
  let currencies = fiats.concat(cryptos);

  this.addCurrencyValidation(sheet, 'C3:C', currencies);
  this.addCurrencyValidation(sheet, 'H3:H', currencies);

}

/**
 * Sets data validation on the wallets columns in the ledger sheet 
 * The list of wallet names is collected when the ledger is processed to write the reports
 * The wallet names are sorted alphabetically
 */
CryptoTracker.prototype.updateLedgerWallets = function () {

  const sheetName = this.ledgerSheetName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return;
  }

  let walletNames = [];
  for (let wallet of this.wallets) {
    walletNames.push(wallet.name);
  }
  walletNames.sort(CryptoTracker.abcComparator);

  this.addWalletValidation(sheet, 'G3:G', walletNames);
  this.addWalletValidation(sheet, 'L3:L', walletNames);

}