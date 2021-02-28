CryptoTracker.prototype.getCryptoCompareTable = function () {

  let apiKey = this.settings['CryptoCompare ApiKey'];

  if (!apiKey) {
    throw Error(`CryptoCompare ApiKey is missing from the settings sheet.`);
  }

  let cryptos = Array.from(this.settings['Cryptos']).toString();
  let fiatConvert = this.settings['Fiat Convert'];

  let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptos}&tsyms=${fiatConvert}&api_key=${apiKey}`;

  let timestamp = new Date().toISOString();
  let httpRequest = UrlFetchApp.fetch(url);
  let returnText = httpRequest.getContentText();
  let data = JSON.parse(returnText);

  let cryptoDataTable = [[`Date Time`, `Crypto`, `Fiat Convert`, `Ex Rate`]];
  for (let coin in data) {

    cryptoDataTable.push([timestamp ,coin, fiatConvert, data[coin][fiatConvert]]);

  }

  return cryptoDataTable;
}

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

  let cryptoDataTable = [[`Date Time`, `Crypto`, `Fiat Convert`, `Ex Rate`]];
  for (let coin in data) {

    cryptoDataTable.push([data[coin].quote[fiatConvert].last_updated, data[coin].symbol, fiatConvert, data[coin].quote[fiatConvert].price]);

  }

  return cryptoDataTable;
}