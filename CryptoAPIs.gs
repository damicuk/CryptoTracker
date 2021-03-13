CryptoTracker.prototype.updateExRates = function () {

  if (this.apiKey && this.apiProvider == 'CryptoCompare') {

    this.getCryptoCompareExRates();

  }
  else if (this.apiKey && this.apiProvider == 'CoinMarketCap') {

    this.getCoinMarketCapExRates();

  }
  else {

    throw Error(`Update Exchange Rates requires either CryptoCompare or CoinMarketCap ApiKey in Settings.`);
  }
}

CryptoTracker.prototype.getCryptoCompareExRates = function () {

  let exRatesTable = this.getCryptoCompareTable();
  this.dumpData(exRatesTable, this.exRatesSheetName);
}

CryptoTracker.prototype.getCoinMarketCapExRates = function () {

  let exRatesTable = this.getCoinMarketCapTable();
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

CryptoTracker.prototype.getCoinMarketCapTable = function () {

  let apiKey = this.apiKey;
  let cryptos = Array.from(this.cryptos).toString();
  let accountingCurrency = this.accountingCurrency;

  let url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${cryptos}&convert=${accountingCurrency}`;

  let requestOptions = {
    method: 'GET',
    uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
    qs: {
      start: 1,
      limit: 5000,
      convert: accountingCurrency
    },
    headers: {
      'X-CMC_PRO_API_KEY': apiKey
    },
    json: true,
    gzip: true
  };

  let httpRequest = UrlFetchApp.fetch(url, requestOptions);
  let returnText = httpRequest.getContentText();
  let data = JSON.parse(returnText).data;

  let exRatesTable = [[`Date Time`, `Coin`, `Fiat`, `Ex Rate`]];
  for (let coin in data) {

    exRatesTable.push([data[coin].quote[accountingCurrency].last_updated, data[coin].symbol, accountingCurrency, data[coin].quote[accountingCurrency].price]);

  }

  return exRatesTable;
}