CryptoTracker.prototype.exRatesSheet = function () {

  const sheetName = this.exRatesSheetName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [[`Date Time`, `Crypto`, `Fiat`, `Ex Rate`]];

    sheet.getRange('A1:D1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B2:C').setNumberFormat('@');
    sheet.getRange('D2:D').setNumberFormat('#,##0.00000;(#,##0.00000)');

    sheet.hideSheet();

    let protection = sheet.protect().setDescription('Essential Data Sheet');
    protection.setWarningOnly(true);

  }

  //check for recent data
  if (this.exRatesCurrent(sheet, 10)) {
    return;
  }

  let dataTable = [];

  try {

    dataTable = this.getCryptoPriceTable();

  }
  catch (err) {

    throw Error(err.message);

  }
  finally {

    this.writeTable(sheet, dataTable, 1, 4);

  }
}

CryptoTracker.prototype.getCryptoPriceTable = function () {

  let apiKey = this.apiKey;

  if (!apiKey) {

    throw Error(`CryptoCompare API key missing 
    
    To get an API key, go to https://www.cryptocompare.com/cryptopian/api-keys register, create a key, and save it in settings.`);

  }

  let cryptos = Array.from(this.cryptos).toString();

  let table = [];

  if (cryptos) {

    let accountingCurrency = this.accountingCurrency;

    let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptos}&tsyms=${accountingCurrency}&api_key=${apiKey}`;

    let timestamp = new Date().toISOString();
    let httpRequest = UrlFetchApp.fetch(url);
    let returnText = httpRequest.getContentText();
    let data = JSON.parse(returnText);

    if (data.Response === "Error") {

      throw Error(data.Message);

    }

    for (let coin in data) {

      table.push([timestamp, coin, accountingCurrency, data[coin][accountingCurrency]]);

    }
  }
  return table;
}
