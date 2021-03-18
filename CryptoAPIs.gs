CryptoTracker.prototype.updateCryptoPrices = function () {

  let cryptos = Array.from(this.cryptos).toString();
  let apiKey = this.apiKey;
  let accountingCurrency = this.accountingCurrency;
  let errorMessage;

  let exRatesTable = [[`Date Time`, `Crypto`, `Fiat`, `Ex Rate`]];

  if (!apiKey) {

    errorMessage = `CryptoCompare API key needs to be saved in settings.`;

  }
  else if (cryptos) {

    let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptos}&tsyms=${accountingCurrency}&api_key=${apiKey}`;

    let timestamp = new Date().toISOString();
    let httpRequest = UrlFetchApp.fetch(url);
    let returnText = httpRequest.getContentText();
    let data = JSON.parse(returnText);

    if (data.Response == "Error") {

      errorMessage = data.Message;

    }
    else {

      for (let coin in data) {

        exRatesTable.push([timestamp, coin, accountingCurrency, data[coin][accountingCurrency]]);

      }
    }
  }

  this.dumpData(exRatesTable, this.exRatesSheetName);

  return errorMessage;

}