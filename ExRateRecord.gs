/**
 * Represents a row in the exrate sheet.
 */
class ExRateRecord {

  /**
   * Assigns each column value to a property.
   * @param {Date} date - the date the price data was obtained.
   * @param {string} crypto - The ticker of the cryptocurrency queried.
   * @param {string} fiat - The ticker of the fiat currency queried.
   * @param {number} exRate - The cryptocurrency to fiat currency exchange rate.
   */
  constructor(date, crypto, fiat, exRate) {

    /**
     * The date the price data was obtained.
     * @type {Date}
     */
    this.date = new Date(date);

    /**
     * The ticker of the cryptocurrency queried.
     * @type {string}
     */
    this.crypto = crypto;

     /**
     * The ticker of the fiat currency queried.
     * @type {string}
     */
    this.fiat = fiat;

    /**
     * The cryptocurrency to fiat currency exchange rate.
     * @type {number}
     */
    this.exRate = exRate;

  }
}

/**
 * Checks whether the prices for all the cryptocurrencies are current within a certain margin of minutes.
 * The list of cryptocurrencies is collected when the ledger is processed.
 * @param {Sheet} sheet - The exrates sheet to search.
 * @param {number} minuteMargin - The number of minutes in the past that price data is still considered current.
 * @return {boolean} Whether the prices for all the cryptocurrencies are current.
 */
CryptoTracker.prototype.exRatesCurrent = function (sheet, minuteMargin) {

  let exRateRecords = this.getExRateRecords(sheet);

  let date = new Date();

  for (let crypto of this.cryptos) {

    if (!this.lookupExRate(exRateRecords, date, crypto, minuteMargin)) {

      return false;
    }
  }
  return true;
};

/**
 * Checks whether the prices for all the cryptocurrencies are current within a certain margin of minutes.
 * The list of cryptocurrencies is collected when the ledger is processed.
 * @param {ExRateRecord[]} exRateRecords - The collection of exrate records to search.
 * @param {Date} date - The date to search allowing for the minute margin.
 * @param {number} minuteMargin - The time difference in minutes between the date and the exrate record date that is still considered a match.
 * @return {number} The cryptocurrency to accounting currency exchange rate closest to the requested date.
 * returns 0 if no match is found within the minute margin.
 */
CryptoTracker.prototype.lookupExRate = function (exRateRecords, date, crypto, minuteMargin) {

  let bestRecord;
  let bestDiff = -(new Date(0, 0, 0)).valueOf();
  let currDiff;
  let marginMs = minuteMargin * 60000;

  for (let record of exRateRecords) {
    if (record.crypto == crypto && record.fiat == this.accountingCurrency) {
      currDiff = Math.abs(record.date - date);
      if (currDiff < bestDiff && currDiff <= marginMs) {
        bestRecord = record;
        bestDiff = currDiff;
      }
    }
  }

  if (bestRecord) {
    return bestRecord.exRate;
  }

  return 0;
};

/**
 * Retrieves the exrate records from the exrates sheet and sorts them by date.
 * @param {Sheet} sheet - The exrates sheet.
 * @return {ExRateRecord[]} The collection of exrate records.
 */
CryptoTracker.prototype.getExRateRecords = function (sheet) {

  let range = sheet.getRange(2, 1, sheet.getMaxRows() - 1, 4);
  let data = range.getValues();

  let exRateRecords = [];
  for (let row of data) {

    let exRateRecord = new ExRateRecord(
      row[0],
      row[1],
      row[2],
      row[3]
    );

    exRateRecords.push(exRateRecord);

  }

  exRateRecords.sort(function (a, b) {
    return a.date - b.date;
  });

  return exRateRecords;
};