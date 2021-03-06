CryptoTracker.prototype.getCryptoDataExRates = function () {

  let ledgerRecords = this.getLedgerRecords();
  this.validateLedgerRecords(ledgerRecords, false);

  let histCryptoRecords = this.getHistCryptoRecords();

  //array of values used to update the sheet
  let debitExRates = [];
  let creditExRates = [];

  //do we need to update these columns?
  let updateDebitExRates = false;
  let updateCreditExRates = false;

  for (let i = 0; i < ledgerRecords.length; i++) {

    let ledgerRecord = ledgerRecords[i];
    let action = ledgerRecord.action;
    let date = ledgerRecord.date;
    let debitCurrency = ledgerRecord.debitCurrency;
    let debitExRate = ledgerRecord.debitExRate;
    let creditCurrency = ledgerRecord.creditCurrency;
    let creditExRate = ledgerRecord.creditExRate;

    if (action == 'Trade') {

      if (this.isCrypto(creditCurrency) && debitCurrency != this.accountingCurrency) { //buy or exchange crypto
        if (debitExRate === '' || debitExRate <= 0) {
          let exRate = this.lookupExRate(histCryptoRecords, date, debitCurrency);
          if (exRate) {
            debitExRate = exRate;
            updateDebitExRates = true;
          }
        }
      }
      if (this.isCrypto(debitCurrency) && creditCurrency != this.accountingCurrency) { //sell or exchange crypto
        if (creditExRate === '' || creditExRate <= 0) {
          let exRate = this.lookupExRate(histCryptoRecords, date, creditCurrency);
          if (exRate) {
            creditExRate = exRate;
            updateCreditExRates = true;
          }
        }
      }
    }
    else if (action == 'Reward') {
      if (creditExRate === '' || creditExRate <= 0) {
        let exRate = this.lookupExRate(histCryptoRecords, date, creditCurrency);
        if (exRate) {
          creditExRate = exRate;
          updateCreditExRates = true;
        }
      }
    }

    debitExRates.push([debitExRate]);
    creditExRates.push([creditExRate]);
  }

  if (updateDebitExRates) {
    this.setExRates(3, debitExRates);
  }

  if (updateCreditExRates) {
    this.setExRates(8, creditExRates);
  }
}

CryptoTracker.prototype.lookupExRate = function (histCryptoRecords, date, currency) {

  let bestRecord;
  let bestDiff = -(new Date(0, 0, 0)).valueOf();
  let currDiff;
  let marginMs = this.exRateMinutesMargin * 60000

  for (let record of histCryptoRecords) {
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

CryptoTracker.prototype.getHistCryptoRecords = function () {

  let histCryptoRange = this.getHistCryptoRange();
  let histCryptoData = histCryptoRange.getValues();

  //convert raw data to object array
  let histCryptoRecords = [];
  for (let row of histCryptoData) {

    let histCryptoRecord = new HistCryptoRecord(
      row[0],
      row[1],
      row[2],
      row[3]
    );

    histCryptoRecords.push(histCryptoRecord);

  }

  //sort by date
  histCryptoRecords.sort(function (a, b) {
    return a.date - b.date;
  });

  return histCryptoRecords;

}

CryptoTracker.prototype.getHistCryptoRange = function () {

  let ss = SpreadsheetApp.getActive();
  let histCryptoSheet = ss.getSheetByName(this.histCryptoSheetName);

  if (!histCryptoSheet) {
    throw Error(`Historical Crypto Data Sheet (${this.histCryptoDataSheetName}) specified in the settings sheet not found. 
    Create file by running 'Fetch Current Crypto Prices' with 'Save Crypto Data' in the settings sheet set to 'TRUE'.`);
  }

  let histCryptoRange = histCryptoSheet.getDataRange();
  histCryptoRange = histCryptoRange.offset(1, 0, histCryptoRange.getHeight() - 1, 4);

  return histCryptoRange;

}

CryptoTracker.prototype.getGoogleFinanceExRates = function () {

  let ledgerRecords = this.getLedgerRecords();
  this.validateLedgerRecords(ledgerRecords, false);

  //array of values used to update the sheet
  let debitExRates = [];
  let creditExRates = [];

  // fill in any missing exchange rates with GOOGLEFINANCE formula
  const formula = `=Index(GoogleFinance(CONCAT("CURRENCY:", CONCAT("#currency#", "#accountingCurrency#")), "close", A#row#), 2,2)`;

  //do we need to update these columns?
  let updateDebitExRates = false;
  let updateCreditExRates = false;

  for (let i = 0; i < ledgerRecords.length; i++) {

    let ledgerRecord = ledgerRecords[i];
    let action = ledgerRecord.action;
    let debitCurrency = ledgerRecord.debitCurrency;
    let debitExRate = ledgerRecord.debitExRate;
    let creditCurrency = ledgerRecord.creditCurrency;
    let creditExRate = ledgerRecord.creditExRate;

    if (action == 'Trade') {

      if (this.isCrypto(creditCurrency) && debitCurrency != this.accountingCurrency) { //buy or exchange crypto
        if (debitExRate === '' || debitExRate <= 0) {
          debitExRate = formula.replace(/#currency#/, debitCurrency).replace(/#accountingCurrency#/, this.accountingCurrency).replace(/#row#/, (i + 3).toString());
          updateDebitExRates = true;
        }
      }
      if (this.isCrypto(debitCurrency) && creditCurrency != this.accountingCurrency) { //sell or exchange crypto
        if (creditExRate === '' || creditExRate <= 0) {
          creditExRate = formula.replace(/#currency#/, creditCurrency).replace(/#accountingCurrency#/, this.accountingCurrency).replace(/#row#/, (i + 3).toString());
          updateCreditExRates = true;
        }
      }
    }
    else if (action == 'Reward') {
      if (creditExRate === '' || creditExRate <= 0) {
        creditExRate = formula.replace(/#currency#/, creditCurrency).replace(/#accountingCurrency#/, this.accountingCurrency).replace(/#row#/, (i + 3).toString());
        updateCreditExRates = true;
      }
    }

    debitExRates.push([debitExRate]);
    creditExRates.push([creditExRate]);
  }

  if (updateDebitExRates) {
    this.setExRates(3, debitExRates, true);
  }

  if (updateCreditExRates) {
    this.setExRates(8, creditExRates, true);
  }
}

CryptoTracker.prototype.setExRates = function (colIndex, exRates, overwrite = false) {

  let ledgerRange = this.getLedgerRange();
  let exRatesRange = ledgerRange.offset(0, colIndex, exRates.length, 1);

  exRatesRange.setValues(exRates);

  //apply changes
  SpreadsheetApp.flush();

  if (overwrite) {
    //read in values calculated by the formula
    //remove failed formula results
    //overwrite the formulas with hard coded values
    let calculatedExRates = exRatesRange.getValues();
    let validExRates = this.removeInvalidExRates(calculatedExRates);
    exRatesRange.setValues(validExRates);

    //applies changes
    SpreadsheetApp.flush();
  }
}

CryptoTracker.prototype.removeInvalidExRates = function (exRates) {

  let validExRates = [];

  for (let exRate of exRates) {
    if (isNaN(exRate[0])) {
      validExRates.push(['']);
    }
    else {
      validExRates.push(exRate);
    }
  }
  return validExRates;
}
