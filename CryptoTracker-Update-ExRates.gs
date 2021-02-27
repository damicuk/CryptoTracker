CryptoTracker.prototype.updateExRates = function () {

  let ledgerRecords = this.getLedgerRecords();
  this.validateLedgerRecords(ledgerRecords, false);

  //array of values used to update the sheet
  let debitExRateValues = [];
  let creditExRateValues = [];

  // fill in any missing exchange rates with GOOGLEFINANCE formula
  const formula = `=Index(GoogleFinance(CONCAT("CURRENCY:", CONCAT("#currency#", "#fiatConvert#")), "close", A#row#), 2,2)`;

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
    let hasDebitExRate = ledgerRecord.hasDebitExRate;
    let hasCreditExRate = ledgerRecord.hasCreditExRate;

    //the value used to update the sheet
    let debitExRateValue = '';
    if (hasDebitExRate) {
      debitExRateValue = debitExRate;
    }

    //the value used to update the sheet
    let creditExRateValue = '';
    if (hasCreditExRate) {
      creditExRateValue = creditExRate;
    }

    if (action == 'Trade') {

      if (this.isCrypto(creditCurrency) && debitCurrency != this.fiatConvert) { //buy or exchange crypto
        if (!hasDebitExRate || debitExRate <= 0) {
          debitExRateValue = formula.replace(/#currency#/, debitCurrency).replace(/#fiatConvert#/, this.fiatConvert).replace(/#row#/, (i + 3).toString());
          updateDebitExRates = true;
        }
      }
      if (this.isCrypto(debitCurrency) && creditCurrency != this.fiatConvert) { //sell or exchange crypto
        if (!hasCreditExRate || creditExRate <= 0) {
          creditExRateValue = formula.replace(/#currency#/, creditCurrency).replace(/#fiatConvert#/, this.fiatConvert).replace(/#row#/, (i + 3).toString());
          updateCreditExRates = true;
        }
      }
    }
    else if (action == 'Reward') {
      if (!hasCreditExRate || creditExRate <= 0) {
        creditExRateValue = formula.replace(/#currency#/, creditCurrency).replace(/#fiatConvert#/, this.fiatConvert).replace(/#row#/, (i + 3).toString());
        updateCreditExRates = true;
      }
    }

    debitExRateValues.push([debitExRateValue]);
    creditExRateValues.push([creditExRateValue]);
  }

  if (updateDebitExRates) {
    this.setExRates(3, debitExRateValues);
  }

  if (updateCreditExRates) {
    this.setExRates(8, creditExRateValues);
  }
}

CryptoTracker.prototype.setExRates = function (colIndex, exRateValues) {

  let ledgerRange = this.getLedgerRange();
  let exRatesRange = ledgerRange.offset(0, colIndex, exRateValues.length, 1);

  exRatesRange.setValues(exRateValues);

  //apply changes
  SpreadsheetApp.flush();

  //read in values calculated by the formula
  //remove failed formula results
  //overwrite the formulas with hard coded values
  let calculatedExRateValues = exRatesRange.getValues();
  let validExRateValues = this.removeInvalidExRates(calculatedExRateValues);
  exRatesRange.setValues(validExRateValues);

  //applies changes
  SpreadsheetApp.flush();
}

CryptoTracker.prototype.removeInvalidExRates = function (exRateValues) {

  let validExRateValues = [];

  for (let exRateValue of exRateValues) {
    if (isNaN(exRateValue[0])) {
      validExRateValues.push(['']);
    }
    else {
      validExRateValues.push(exRateValue);
    }
  }
  return validExRateValues;
}
