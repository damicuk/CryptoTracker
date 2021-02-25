CryptoTracker.prototype.getCoinMarketCapTable = function () {

  let apiKey = this.settings['CoinMarketCap ApiKey'];

  if (!apiKey) {
    throw Error(`CoinMarketCap ApiKey is missing from the settings sheet.`);
  }

  let cryptos = Array.from(this.settings['Cryptos']).toString();
  let fiatConvert = this.settings['Fiat Convert'];

  let url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${cryptos}&convert=${fiatConvert}`;

  let requestOptions = {
    method: 'GET',
    uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
    qs: {
      start: 1,
      limit: 5000,
      convert: fiatConvert
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

  let cryptoDataTable = [[`Crypto`, `Price (${fiatConvert})`, `% Change 24h`]];
  for (let coin in data) {

    cryptoDataTable.push([data[coin].symbol, data[coin].quote[fiatConvert].price, data[coin].quote[fiatConvert].percent_change_24h]);

  }

  return cryptoDataTable;
}

CryptoTracker.prototype.getCryptoCompareTable = function () {

  let apiKey = this.settings['CryptoCompare ApiKey'];

  if (!apiKey) {
    throw Error(`CryptoCompare ApiKey is missing from the settings sheet.`);
  }

  let cryptos = Array.from(this.settings['Cryptos']).toString();
  let fiatConvert = this.settings['Fiat Convert'];

  let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptos}&tsyms=${fiatConvert}&api_key=${apiKey}`;

  let httpRequest = UrlFetchApp.fetch(url);
  let returnText = httpRequest.getContentText();
  let data = JSON.parse(returnText);

  let cryptoDataTable = [[`Crypto`, `Price (${fiatConvert})`]];
  for (let coin in data) {

    cryptoDataTable.push([coin, data[coin][fiatConvert]]);

  }

  return cryptoDataTable;
}

