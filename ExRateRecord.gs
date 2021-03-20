class ExRateRecord {

  constructor(date, crypto, fiat, exRate) {

    this.date = new Date(date);
    this.crypto = crypto;
    this.fiat = fiat;
    this.exRate = exRate;

  }
}

CryptoTracker.prototype.exRatesCurrent = function (sheet, minuteMargin) {

  let exRateRecords = this.getExRateRecords(sheet);

  let date = new Date();

  for (crypto of this.cryptos) {

    if (!this.lookupExRate(exRateRecords, date, crypto, minuteMargin)) {

      return false;
    }
  }
  return true;
}

CryptoTracker.prototype.lookupExRate = function (exRateRecords, date, currency, minuteMargin) {

  let bestRecord;
  let bestDiff = -(new Date(0, 0, 0)).valueOf();
  let currDiff;
  let marginMs = minuteMargin * 60000

  for (let record of exRateRecords) {
    if (record.crypto == currency && record.fiat == this.accountingCurrency) {
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
}

CryptoTracker.prototype.getExRateRecords = function (sheet) {

  let rows = sheet.getMaxRows();
  let columns = sheet.getMaxColumns();

  if (rows < 2 || columns < 4) {

    return false;

  }

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
}