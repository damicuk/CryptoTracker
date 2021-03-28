/**
 * Retrieves and validates the ledger records
 * Uses the error handler to handle any ValidatioError
 * Displays toast on success
 */
CryptoTracker.prototype.validateLedger = function () {

  let ledgerRecords = this.getLedgerRecords();

  try {
    this.validateLedgerRecords(ledgerRecords);
  }
  catch (error) {
    if (error instanceof ValidationError) {
      this.handleError('validation', error.message, error.rowIndex, error.columnName);
      return;
    }
    else {
      throw error;
    }
  }

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);
}

/**
 * Validates a set of ledger records and throws a ValidationError on failure
 * @param {LedgerRecord[]} ledgerRecords - The colection of ledger records to validate
 */
CryptoTracker.prototype.validateLedgerRecords = function (ledgerRecords) {

  //ledger sheet row numbers start at 1 plus two header rows
  let rowIndex = 3;
  for (let ledgerRecord of ledgerRecords) {
    this.validateLedgerRecord(ledgerRecord, rowIndex++);
  }
}

/**
 * Validates a ledger record and throws a ValidationError on failure
 * @param {LedgerRecord} ledgerRecord - The ledger record to validate
 */
CryptoTracker.prototype.validateLedgerRecord = function (ledgerRecord, rowIndex) {

  let date = ledgerRecord.date;
  let action = ledgerRecord.action;
  let debitCurrency = ledgerRecord.debitCurrency;
  let debitExRate = ledgerRecord.debitExRate;
  let debitAmount = ledgerRecord.debitAmount;
  let debitFee = ledgerRecord.debitFee;
  let debitWalletName = ledgerRecord.debitWalletName;
  let creditCurrency = ledgerRecord.creditCurrency;
  let creditExRate = ledgerRecord.creditExRate;
  let creditAmount = ledgerRecord.creditAmount;
  let creditFee = ledgerRecord.creditFee;
  let creditWalletName = ledgerRecord.creditWalletName;
  let lotMatching = ledgerRecord.lotMatching;

  if (isNaN(date)) {
    throw new ValidationError(`${action} row ${rowIndex}: missing date.`, rowIndex, 'date');
  }
  else if (date > new Date()) {
    throw new ValidationError(`${action} row ${rowIndex}: date must be in the past.`, rowIndex, 'date');
  }
  else if (action === '') {
    throw new ValidationError(`Ledger row ${rowIndex}: no action specified.`, rowIndex, 'action');
  }
  else if (debitCurrency && !this.isFiat(debitCurrency) && !this.isCrypto(debitCurrency)) {
    throw new ValidationError(`${action} row ${rowIndex}: debit currency (${debitCurrency}) is not recognized - neither fiat (${CryptoTracker.validFiats.join(', ')}) nor crypto (2-9 characters [A-Za-z0-9_]).`, rowIndex, 'debitCurrency');
  }
  else if (isNaN(debitExRate)) {
    throw new ValidationError(`${action} row ${rowIndex}: debit exchange rate is not valid (number or blank).`, rowIndex, 'debitExRate');
  }
  else if (CryptoTracker.decimalDigits(debitExRate) > 8) {
    throw new ValidationError(`${action} row ${rowIndex}: debit exchange rate has more than 8 decimal places.`, rowIndex, 'debitExRate');
  }
  else if (isNaN(debitAmount)) {
    throw new ValidationError(`${action} row ${rowIndex}: debit amount is not valid (number or blank).`, rowIndex, 'debitAmount');
  }
  else if (this.isFiat(debitCurrency) && CryptoTracker.decimalDigits(debitAmount) > 2) {
    throw new ValidationError(`${action} row ${rowIndex}: fiat currency debit amount has more than 2 decimal places.`, rowIndex, 'debitAmount');
  }
  else if (CryptoTracker.decimalDigits(debitAmount) > 8) {
    throw new ValidationError(`${action} row ${rowIndex}: debit amount has more than 8 decimal places.`, rowIndex, 'debitAmount');
  }
  else if (isNaN(debitFee)) {
    throw new ValidationError(`${action} row ${rowIndex}: debit fee is not valid (number or blank).`, rowIndex, 'debitFee');
  }
  else if (this.isFiat(debitCurrency) && CryptoTracker.decimalDigits(debitFee) > 2) {
    throw new ValidationError(`${action} row ${rowIndex}: fiat currency debit fee has more than 2 decimal places.`, rowIndex, 'debitFee');
  }
  else if (CryptoTracker.decimalDigits(debitFee) > 8) {
    throw new ValidationError(`${action} row ${rowIndex}: debit fee has more than 8 decimal places.`, rowIndex, 'debitFee');
  }
  else if (creditCurrency && !this.isFiat(creditCurrency) && !this.isCrypto(creditCurrency)) {
    throw new ValidationError(`${action} row ${rowIndex}: credit currency (${creditCurrency}) is not recognized - neither fiat (${CryptoTracker.validFiats.join(', ')}) nor crypto (2-9 characters [A-Za-z0-9_]).`, rowIndex, 'creditCurrency');
  }
  else if (isNaN(creditExRate)) {
    throw new ValidationError(`${action} row ${rowIndex}: credit exchange rate is not valid (number or blank).`, rowIndex, 'creditExRate');
  }
  else if (CryptoTracker.decimalDigits(creditExRate) > 8) {
    throw new ValidationError(`${action} row ${rowIndex}: credit exchange rate has more than 8 decimal places.`, rowIndex, 'creditExRate');
  }
  else if (isNaN(creditAmount)) {
    throw new ValidationError(`${action} row ${rowIndex}: credit amount is not valid (number or blank).`, rowIndex, 'creditAmount');
  }
  else if (this.isFiat(creditCurrency) && CryptoTracker.decimalDigits(creditAmount) > 2) {
    throw new ValidationError(`${action} row ${rowIndex}: fiat currency credit amount has more than 2 decimal places.`, rowIndex, 'creditAmount');
  }
  else if (CryptoTracker.decimalDigits(creditAmount) > 8) {
    throw new ValidationError(`${action} row ${rowIndex}: credit amount has more than 8 decimal places.`, rowIndex, 'creditAmount');
  }
  else if (isNaN(creditFee)) {
    throw new ValidationError(`${action} row ${rowIndex}: credit fee is not valid (number or blank).`, rowIndex, 'creditFee');
  }
  else if (this.isFiat(creditCurrency) && CryptoTracker.decimalDigits(creditFee) > 2) {
    throw new ValidationError(`${action} row ${rowIndex}: fiat currency credit fee has more than 2 decimal places.`, rowIndex, 'creditFee');
  }
  else if (CryptoTracker.decimalDigits(creditFee) > 8) {
    throw new ValidationError(`${action} row ${rowIndex}: credit fee has more than 8 decimal places.`, rowIndex, 'creditFee');
  }
  else if (lotMatching && !CryptoTracker.lotMatchings.includes(lotMatching)) {
    throw new ValidationError(`${action} row ${rowIndex}: lot matching (${lotMatching}) is not valid (${CryptoTracker.lotMatchings.join(', ')}) or blank.`, rowIndex, 'lotMatching');
  }
  else if (action === 'Transfer') { //Transfer
    if (!debitCurrency) {
      throw new ValidationError(`${action} row ${rowIndex}: no debit currency specified.`, rowIndex, 'debitCurrency');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: no debit amount specified.`, rowIndex, 'debitAmount');
    }
    else if (debitAmount <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: debit amount must be greater than 0.`, rowIndex, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: debit fee must be greater or equal to 0 (or blank).`, rowIndex, 'debitFee');
    }
    else if (creditCurrency) {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit currency (${creditCurrency}) blank. It is inferred from the debit currency (${debitCurrency}).`, rowIndex, 'creditCurrency');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else if (creditAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit amount blank. It is inferred from the debit amount and debit fee.`, rowIndex, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (!debitWalletName && !creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: no debit or credit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (this.isFiat(debitCurrency)) { //Fiat transfer
      if (debitWalletName && creditWalletName) {
        throw new ValidationError(`${action} row ${rowIndex}: fiat transfer leave debit wallet (${debitWalletName}) blank for deposits or credit wallet (${creditWalletName}) blank for withdrawals.`, rowIndex, 'debitWalletName');
      }
    }
    else if (this.isCrypto(debitCurrency)) { //Crypto transfer
      if (!debitWalletName) {
        throw new ValidationError(`${action} row ${rowIndex}: no debit wallet specified.`, rowIndex, 'debitWalletName');
      }
      else if (!creditWalletName) {
        throw new ValidationError(`${action} row ${rowIndex}: no credit wallet specified.`, rowIndex, 'creditWalletName');
      }
      else if (debitWalletName === creditWalletName) {
        throw new ValidationError(`${action} row ${rowIndex}: debit wallet (${debitWalletName}) and credit wallet (${creditWalletName}) must be different.`, rowIndex, 'debitWalletName');
      }
    }
  }
  else if (action === 'Trade') { //Trade
    if (!debitCurrency) {
      throw new ValidationError(`${action} row ${rowIndex}: no debit currency specified.`, rowIndex, 'debitCurrency');
    }
    else if (!creditCurrency) {
      throw new ValidationError(`${action} row ${rowIndex}: no credit currency specified.`, rowIndex, 'creditCurrency');
    }
    else if (debitCurrency === creditCurrency) {
      throw new ValidationError(`${action} row ${rowIndex}: debit currency (${debitCurrency}) and credit currency (${creditCurrency}) must be different.`, rowIndex, 'debitCurrency');
    }
    else if (this.isFiat(debitCurrency) && this.isFiat(creditCurrency)) {
      throw new ValidationError(`${action} row ${rowIndex}: both debit currency (${debitCurrency}) and credit currency (${creditCurrency}) are fiat, not supported.`, rowIndex, 'debitCurrency');
    }
    else if (!debitWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: no debit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: no debit amount specified.`, rowIndex, 'debitAmount');
    }
    else if (debitAmount < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: debit amount must be greater or equal to 0.`, rowIndex, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: debit fee must be greater or equal to 0 (or blank).`, rowIndex, 'debitFee');
    }
    else if (creditAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: no credit amount specified.`, rowIndex, 'creditAmount');
    }
    else if (creditAmount < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: credit amount must be greater or equal to 0.`, rowIndex, 'creditAmount');
    }
    else if (creditFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: credit fee must be greater or equal to 0 (or blank).`, rowIndex, 'creditFee');
    }
    else if (creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit wallet (${creditWalletName}) blank. It is inferred from the debit wallet (${debitWalletName}).`, rowIndex, 'creditWalletName');
    }
    else if (debitCurrency === this.accountingCurrency && debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: debit currency (${debitCurrency}) is the accounting currency (${this.accountingCurrency}). Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (creditCurrency === this.accountingCurrency && creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: credit currency (${creditCurrency}) is the accounting currency (${this.accountingCurrency}). Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else {
      if (this.isCrypto(creditCurrency) && debitCurrency != this.accountingCurrency) { //buy or exchange crypto
        if (debitExRate === '') {
          throw new ValidationError(`${action} row ${rowIndex}: missing debit currency (${debitCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'debitExRate');
        }
        else if (debitExRate <= 0) {
          throw new ValidationError(`${action} row ${rowIndex}: debit exchange rate must be greater than 0.`, rowIndex, 'debitExRate');
        }
      }
      if (this.isCrypto(debitCurrency) && creditCurrency != this.accountingCurrency) { //sell or exchange crypto
        if (creditExRate === '') {
          throw new ValidationError(`${action} row ${rowIndex}: missing credit currency (${creditCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'creditExRate');
        }
        else if (creditExRate <= 0) {
          throw new ValidationError(`${action} row ${rowIndex}: credit exchange rate must be greater than 0.`, rowIndex, 'creditExRate');
        }
      }
    }
  }
  else if (action === 'Income') { //Income
    if (debitCurrency) {
      throw new ValidationError(`${action} row ${rowIndex}: leave debit currency (${debitCurrency}) blank.`, rowIndex, 'debitCurrency');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave debit amount blank.`, rowIndex, 'debitAmount');
    }
    else if (debitFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave debit fee blank.`, rowIndex, 'debitFee');
    }
    else if (debitWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: leave debit wallet (${debitWalletName}) blank.`, rowIndex, 'debitWalletName');
    }
    else if (!creditCurrency) {
      throw new ValidationError(`${action} row ${rowIndex}: no credit currency specified.`, rowIndex, 'creditCurrency');
    }
    else if (this.isFiat(creditCurrency)) {
      throw new ValidationError(`${action} row ${rowIndex}: credit currency (${creditCurrency}) is fiat, not supported.`, rowIndex, 'creditCurrency');
    }
    else if (creditExRate === '') {
      throw new ValidationError(`${action} row ${rowIndex}: missing credit currency (${creditCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'creditExRate');
    }
    else if (creditExRate <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: credit exchange rate must be greater than 0.`, rowIndex, 'creditExRate');
    }
    else if (creditAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: no credit amount specified.`, rowIndex, 'creditAmount');
    }
    else if (creditAmount <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: credit amount must be greater than 0.`, rowIndex, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (!creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: no credit wallet specified.`, rowIndex, 'creditWalletName');
    }
  }
  else if (action === 'Donation' || action === 'Payment') { //Donation or Payment
    if (!debitCurrency) {
      throw new ValidationError(`${action} row ${rowIndex}: no debit currency specified.`, rowIndex, 'debitCurrency');
    }
    else if (this.isFiat(debitCurrency)) {
      throw new ValidationError(`${action} row ${rowIndex}: debit currency (${debitCurrency}) is fiat, not supported.`, rowIndex, 'debitCurrency');
    }
    else if (debitExRate === '') {
      throw new ValidationError(`${action} row ${rowIndex}: missing debit currency (${debitCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'debitExRate');
    }
    else if (debitExRate <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: debit exchange rate must be greater than 0.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: no debit amount specified.`, rowIndex, 'debitAmount');
    }
    else if (debitAmount <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: debit amount must be greater than 0.`, rowIndex, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: debit fee must be greater or equal to 0 (or blank).`, rowIndex, 'debitFee');
    }
    else if (!debitWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: no debit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (creditCurrency) {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit currency (${creditCurrency}) blank.`, rowIndex, 'creditCurrency');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else if (creditAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit amount blank.`, rowIndex, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit wallet (${creditWalletName}) blank.`, rowIndex, 'creditWalletName');
    }
  }
  else if (action === 'Gift') { //Gift
    if (!debitCurrency) {
      throw new ValidationError(`${action} row ${rowIndex}: no debit currency specified.`, rowIndex, 'debitCurrency');
    }
    else if (this.isFiat(debitCurrency)) {
      throw new ValidationError(`${action} row ${rowIndex}: debit currency (${debitCurrency}) is fiat, not supported.`, rowIndex, 'debitCurrency');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: no debit amount specified.`, rowIndex, 'debitAmount');
    }
    else if (debitAmount <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: debit amount must be greater than 0.`, rowIndex, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: debit fee must be greater or equal to 0 (or blank).`, rowIndex, 'debitFee');
    }
    else if (!debitWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: no debit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (creditCurrency) {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit currency (${creditCurrency}) blank.`, rowIndex, 'creditCurrency');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else if (creditAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit amount blank.`, rowIndex, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: leave credit wallet (${creditWalletName}) blank.`, rowIndex, 'creditWalletName');
    }
  }
  else {
    throw new ValidationError(`Ledger row ${rowIndex}: action (${action}) is invalid.`, rowIndex, 'action');
  }
}