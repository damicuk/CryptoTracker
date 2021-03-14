CryptoTracker.prototype.updateCryptoPrices = function () {
  
  let cryptos = Array.from(this.cryptos).toString();
  let apiKey = this.apiKey;
  let accountingCurrency = this.accountingCurrency;

  if(!cryptos) {

    return;
  }

  if (!apiKey) {

    throw Error(`Update Exchange Rates requires a CryptoCompare API key in settings.`); 
  }

  let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptos}&tsyms=${accountingCurrency}&api_key=${apiKey}`;

  let timestamp = new Date().toISOString();
  let httpRequest = UrlFetchApp.fetch(url);
  let returnText = httpRequest.getContentText();
  let data = JSON.parse(returnText);

  let exRatesTable = [[`Date Time`, `Coin`, `Fiat`, `Ex Rate`]];
  for (let coin in data) {

    exRatesTable.push([timestamp, coin, accountingCurrency, data[coin][accountingCurrency]]);

  }

  this.dumpData(exRatesTable, this.exRatesSheetName);

}