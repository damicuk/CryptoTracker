CryptoTracker.prototype.getCryptoCompareTable = function () {

  let apiKey = this.cryptoCompareApiKey;

  if (!apiKey) {
    throw Error(`CryptoCompare ApiKey is missing from the settings sheet.`);
  }

  let cryptos = this.cryptos;
  let accountingCurrency = this.accountingCurrency;

  let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptos}&tsyms=${accountingCurrency}&api_key=${apiKey}`;

  let timestamp = new Date().toISOString();
  let httpRequest = UrlFetchApp.fetch(url);
  let returnText = httpRequest.getContentText();
  let data = JSON.parse(returnText);

  let cryptoDataTable = [[`Date Time`, `Crypto`, `Accounting Currency`, `Ex Rate`]];
  for (let coin in data) {

    cryptoDataTable.push([timestamp ,coin, accountingCurrency, data[coin][accountingCurrency]]);

  }

  return cryptoDataTable;
}

CryptoTracker.prototype.getCoinMarketCapTable = function () {

  let apiKey = this.coinMarketCapApiKey;

  if (!apiKey) {
    throw Error(`CoinMarketCap ApiKey is missing from the settings sheet.`);
  }

  let cryptos = this.cryptos;
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

  let cryptoDataTable = [[`Date Time`, `Crypto`, `Accounting Currency`, `Ex Rate`]];
  for (let coin in data) {

    cryptoDataTable.push([data[coin].quote[accountingCurrency].last_updated, data[coin].symbol, accountingCurrency, data[coin].quote[accountingCurrency].price]);

  }

  return cryptoDataTable;
}