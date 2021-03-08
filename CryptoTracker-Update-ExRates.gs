CryptoTracker.prototype.getSavedExRates = function () {

  let ledgerRecords = this.getLedgerRecords();
  this.validateLedgerRecords(ledgerRecords, false);

  let exRateRecords = this.getExRateRecords();

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
          let exRate = this.lookupExRate(exRateRecords, date, debitCurrency);
          if (exRate) {
            debitExRate = exRate;
            updateDebitExRates = true;
          }
        }
      }
      if (this.isCrypto(debitCurrency) && creditCurrency != this.accountingCurrency) { //sell or exchange crypto
        if (creditExRate === '' || creditExRate <= 0) {
          let exRate = this.lookupExRate(exRateRecords, date, creditCurrency);
          if (exRate) {
            creditExRate = exRate;
            updateCreditExRates = true;
          }
        }
      }
    }
    else if (action == 'Income') {
      if (creditExRate === '' || creditExRate <= 0) {
        let exRate = this.lookupExRate(exRateRecords, date, creditCurrency);
        if (exRate) {
          creditExRate = exRate;
          updateCreditExRates = true;
        }
      }
    }
    else if (action == 'Donation' || action == 'Payment') {
      if (debitExRate === '' || debitExRate <= 0) {
        let exRate = this.lookupExRate(exRateRecords, date, debitCurrency);
        if (exRate) {
          debitExRate = exRate;
          updateDebitExRates = true;
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

CryptoTracker.prototype.lookupExRate = function (exRateRecords, date, currency) {

  let bestRecord;
  let bestDiff = -(new Date(0, 0, 0)).valueOf();
  let currDiff;
  let marginMs = this.exRateMinutesMargin * 60000

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

CryptoTracker.prototype.getExRateRecords = function () {

  let savedExRatesRange = this.getSavedExRatesRange();
  let exRatesData = savedExRatesRange.getValues();

  //convert raw data to object array
  let exRateRecords = [];
  for (let row of exRatesData) {

    let exRateRecord = new ExRateRecord(
      row[0],
      row[1],
      row[2],
      row[3]
    );

    exRateRecords.push(exRateRecord);

  }

  //sort by date
  exRateRecords.sort(function (a, b) {
    return a.date - b.date;
  });

  return exRateRecords;

}

CryptoTracker.prototype.getSavedExRatesRange = function () {

  let ss = SpreadsheetApp.getActive();
  let savedExRatesSheet = ss.getSheetByName(this.savedExRatesSheetName);

  if (!savedExRatesSheet) {
    throw Error(`Saved Ex Rates Sheet (${this.savedExRatesSheetName}) specified in the settings sheet not found. 
    Create file by running 'Update Current Ex Rates' with 'Save Ex Rates' in the settings sheet set to 'TRUE'.`);
  }

  let savedExRatesRange = savedExRatesSheet.getDataRange();
  savedExRatesRange = savedExRatesRange.offset(1, 0, savedExRatesRange.getHeight() - 1, 4);

  return savedExRatesRange;

}

CryptoTracker.prototype.getGoogleFinanceExRates = function () {

  let ledgerRecords = this.getLedgerRecords();
  this.validateLedgerRecords(ledgerRecords, false);

  //array of values used to update the sheet
  let debitExRates = [];
  let creditExRates = [];
  
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
          debitExRate = this.getGoogleFinanceFormula(debitCurrency, i);
          updateDebitExRates = true;
        }
      }
      if (this.isCrypto(debitCurrency) && creditCurrency != this.accountingCurrency) { //sell or exchange crypto
        if (creditExRate === '' || creditExRate <= 0) {
          creditExRate = this.getGoogleFinanceFormula(creditCurrency, i);
          updateCreditExRates = true;
        }
      }
    }
    else if (action == 'Income') {
      if (creditExRate === '' || creditExRate <= 0) {
        creditExRate = this.getGoogleFinanceFormula(creditCurrency, i);
        updateCreditExRates = true;
      }
    }
    else if (action == 'Donation' || action == 'Payment') {
      if (debitExRate === '' || debitExRate <= 0) {
        debitExRate = this.getGoogleFinanceFormula(debitCurrency, i);
        updateDebitExRates = true;
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

CryptoTracker.prototype.getGoogleFinanceFormula = function(currency, ledgerRecordIndex) {

  const formula = `=Index(GoogleFinance(CONCAT("CURRENCY:", CONCAT("#currency#", "#accountingCurrency#")), "close", A#row#), 2,2)`;
  return formula.replace(/#currency#/, currency).replace(/#accountingCurrency#/, this.accountingCurrency).replace(/#row#/, (ledgerRecordIndex + 3).toString());

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
