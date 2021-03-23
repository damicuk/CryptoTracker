/**
 * Creates the exrates sheet if it doesn't already exist
 * Checks whether the prices for all the cryptocurrencies are current within 10 minutes
 * Updates the sheet with the current prices from the CryptoCompare API if required
 * Catches any ApiError, writes an empty table to preserve references, and rethrows the ApiError
 * Trims the sheet to fit the data
 */
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
  catch (error) {
    if (error instanceof ApiError) {
      //write the empty table to the sheet anyway preserve references
      this.writeTable(sheet, dataTable, 1, 4);
      throw error;
    }
    else {
      throw error;
    }
  }
  this.writeTable(ss, sheet, dataTable, 'ExRates', 1, 4);
}

/**
 * Returns a table of price data for the current set of cryptocurrencies in the accounting currency obtained from the CryptoCompare API
 * The list of cryptocurrencies is collected when the ledger is processed
 * Throws an ApiError if the API key is not set in settings
 * Throws an ApiError if the call to the CryptoCompare API returns an error response
 * @return {*[][]} The table of price data for the current set of cryptocurrencies in the accounting currency
 */
CryptoTracker.prototype.getCryptoPriceTable = function () {

  let table = [];
  let cryptos = Array.from(this.cryptos).toString();
  let apiKey = this.apiKey;

  if (cryptos) {

    if (!apiKey) {

      let errorMessage = `CryptoCompare API key missing 
    
    To get an API key, go to https://www.cryptocompare.com/cryptopian/api-keys register, create a key, and save it in settings.`

      throw new ApiError(errorMessage);

    }

    let accountingCurrency = this.accountingCurrency;

    let timestamp = new Date().toISOString();
    let data = this.getCryptoPriceData(cryptos, accountingCurrency, apiKey);

    if (data.Response === "Error") {

      throw new ApiError(data.Message);

    }
    else {

      for (let coin in data) {

        table.push([timestamp, coin, accountingCurrency, data[coin][accountingCurrency]]);

      }
    }
  }
  return table;
}