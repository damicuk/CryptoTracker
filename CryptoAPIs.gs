CryptoTracker.prototype.updateExRates = function () {

  if (this.apiKey) {

    this.getCryptoCompareExRates();

  }
  else {

    throw Error(`Update Exchange Rates requires a CryptoCompare API key in settings.`);
  }
}

CryptoTracker.prototype.getCryptoCompareExRates = function () {

  let exRatesTable = this.getCryptoCompareTable();
  this.dumpData(exRatesTable, this.exRatesSheetName);
}

CryptoTracker.prototype.getCryptoCompareTable = function () {

  let apiKey = this.apiKey;
  let cryptos = Array.from(this.cryptos).toString();
  let accountingCurrency = this.accountingCurrency;

  let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptos}&tsyms=${accountingCurrency}&api_key=${apiKey}`;

  let timestamp = new Date().toISOString();
  let httpRequest = UrlFetchApp.fetch(url);
  let returnText = httpRequest.getContentText();
  let data = JSON.parse(returnText);

  let exRatesTable = [[`Date Time`, `Coin`, `Fiat`, `Ex Rate`]];
  for (let coin in data) {

    exRatesTable.push([timestamp, coin, accountingCurrency, data[coin][accountingCurrency]]);

  }

  return exRatesTable;
}