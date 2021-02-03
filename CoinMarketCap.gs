function getCryptoPrice() {

  let cryptos = Array.from(settings.get('Cryptos')).toString();
  let fiatConvert = settings.get('Fiat Convert');
  let apiKey = settings.get('CoinMarketCap ApiKey');
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  const externalDataSheetName = "External Data";
  let externalDataSheet = ss.getSheetByName(externalDataSheetName);
  if (!externalDataSheet) {
      externalDataSheet = ss.insertSheet(externalDataSheetName);
  }
  
  let url ="https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=" + cryptos;

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
  
  // let httpRequest = UrlFetchApp.fetch(url, requestOptions);
  // let getContext = httpRequest.getContentText();

  // let data = JSON.parse(getContext).data;
  // let coinTable = [["Crypto","Price", "% Change 24h"]];
  // for(let coin in data) {
  //   coinTable.push([data[coin].symbol, data[coin].quote[fiatConvert].price, data[coin].quote[fiatConvert].percent_change_24h]);
  // }
  // externalDataSheet.clear();
  // externalDataSheet.getRange(1,1, coinTable.length, 3).setValues(coinTable);
  
}
