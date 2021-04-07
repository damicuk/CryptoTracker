/**
 * Retrieves and validates the ledger records.
 * Uses the error handler to handle any ValidatioError.
 * Displays toast on success.
 */
CryptoTracker.prototype.validateLedger = function () {


  try {
    let ledgerRecords = this.getLedgerRecords();
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
};

/**
 * Validates a set of ledger records and throws a ValidationError on failure.
 * @param {LedgerRecord[]} ledgerRecords - The colection of ledger records to validate.
 */
CryptoTracker.prototype.validateLedgerRecords = function (ledgerRecords) {

  //ledger sheet row numbers start at 1 plus two header rows
  let rowIndex = 3;
  for (let ledgerRecord of ledgerRecords) {
    this.validateLedgerRecord(ledgerRecord, rowIndex++);
  }
};

/**
 * Validates a ledger record and throws a ValidationError on failure.
 * @param {LedgerRecord} ledgerRecord - The ledger record to validate.
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
    throw new ValidationError(`${action} row ${rowIndex}: invalid date.`, rowIndex, 'date');
  }
  else if (date > new Date()) {
    throw new ValidationError(`${action} row ${rowIndex}: date must be in the past.`, rowIndex, 'date');
  }
  else if (action === '') {
    throw new ValidationError(`Ledger row ${rowIndex}: no action specified.`, rowIndex, 'action');
  }
  else if (debitCurrency && !Currency.isFiat(debitCurrency) && !Currency.isCrypto(debitCurrency)) {
    throw new ValidationError(`${action} row ${rowIndex}: debit currency (${debitCurrency}) is not recognized - neither fiat (${Currency.validFiats.join(', ')}) nor crypto (2-9 characters [A-Za-z0-9_]).`, rowIndex, 'debitCurrency');
  }
  else if (isNaN(debitExRate)) {
    throw new ValidationError(`${action} row ${rowIndex}: debit exchange rate is not valid (number or blank).`, rowIndex, 'debitExRate');
  }
  else if (Currency.decimalDigits(debitExRate) > 8) {
    throw new ValidationError(`${action} row ${rowIndex}: debit exchange rate has more than 8 decimal places.`, rowIndex, 'debitExRate');
  }
  else if (isNaN(debitAmount)) {
    throw new ValidationError(`${action} row ${rowIndex}: debit amount is not valid (number or blank).`, rowIndex, 'debitAmount');
  }
  else if (Currency.decimalDigits(debitAmount) > Currency.validDecimalDigits(debitCurrency)) {
    throw new ValidationError(`${action} row ${rowIndex}: ${debitCurrency} debit amount has more than ${Currency.validDecimalDigits(debitCurrency)} decimal places.`, rowIndex, 'debitAmount');
  }
  else if (isNaN(debitFee)) {
    throw new ValidationError(`${action} row ${rowIndex}: debit fee is not valid (number or blank).`, rowIndex, 'debitFee');
  }
  else if (Currency.decimalDigits(debitFee) > Currency.validDecimalDigits(debitCurrency)) {
    throw new ValidationError(`${action} row ${rowIndex}: ${debitCurrency} debit fee has more than ${Currency.validDecimalDigits(debitCurrency)} decimal places.`, rowIndex, 'debitFee');
  }
  else if (creditCurrency && !Currency.isFiat(creditCurrency) && !Currency.isCrypto(creditCurrency)) {
    throw new ValidationError(`${action} row ${rowIndex}: credit currency (${creditCurrency}) is not recognized - neither fiat (${Currency.validFiats.join(', ')}) nor crypto (2-9 characters [A-Za-z0-9_]).`, rowIndex, 'creditCurrency');
  }
  else if (isNaN(creditExRate)) {
    throw new ValidationError(`${action} row ${rowIndex}: credit exchange rate is not valid (number or blank).`, rowIndex, 'creditExRate');
  }
  else if (Currency.decimalDigits(creditExRate) > 8) {
    throw new ValidationError(`${action} row ${rowIndex}: credit exchange rate has more than 8 decimal places.`, rowIndex, 'creditExRate');
  }
  else if (isNaN(creditAmount)) {
    throw new ValidationError(`${action} row ${rowIndex}: credit amount is not valid (number or blank).`, rowIndex, 'creditAmount');
  }
  else if (Currency.decimalDigits(creditAmount) > Currency.validDecimalDigits(creditCurrency)) {
    throw new ValidationError(`${action} row ${rowIndex}: ${creditCurrency} credit amount has more than ${Currency.validDecimalDigits(creditCurrency)} decimal places.`, rowIndex, 'creditAmount');
  }
  else if (isNaN(creditFee)) {
    throw new ValidationError(`${action} row ${rowIndex}: credit fee is not valid (number or blank).`, rowIndex, 'creditFee');
  }
  else if (Currency.decimalDigits(creditFee) > Currency.validDecimalDigits(creditCurrency)) {
    throw new ValidationError(`${action} row ${rowIndex}: ${creditCurrency} credit fee has more than ${Currency.validDecimalDigits(creditCurrency)} decimal places.`, rowIndex, 'creditFee');
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
    else if (Currency.isFiat(debitCurrency)) { //Fiat transfer
      if (debitWalletName && creditWalletName) {
        throw new ValidationError(`${action} row ${rowIndex}: fiat transfer leave debit wallet (${debitWalletName}) blank for deposits or credit wallet (${creditWalletName}) blank for withdrawals.`, rowIndex, 'debitWalletName');
      }
    }
    else if (Currency.isCrypto(debitCurrency)) { //Crypto transfer
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
    else if (Currency.isFiat(debitCurrency) && Currency.isFiat(creditCurrency)) {
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
    else if (Currency.isCrypto(creditCurrency) && creditFee >= creditAmount) {
      throw new ValidationError(`${action} row ${rowIndex}: crypto credit fee must be less than the credit amount (or blank).`, rowIndex, 'creditFee');
    }
    else if (creditFee > creditAmount) {
      throw new ValidationError(`${action} row ${rowIndex}: fiat credit fee must be less than or equal to credit amount (or blank).`, rowIndex, 'creditFee');
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
      if (Currency.isCrypto(creditCurrency) && debitCurrency != this.accountingCurrency) { //buy or exchange crypto
        if (debitExRate === '') {
          throw new ValidationError(`${action} row ${rowIndex}: missing debit currency (${debitCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'debitExRate');
        }
        else if (debitExRate <= 0) {
          throw new ValidationError(`${action} row ${rowIndex}: debit exchange rate must be greater than 0.`, rowIndex, 'debitExRate');
        }
      }
      if (Currency.isCrypto(debitCurrency) && creditCurrency != this.accountingCurrency) { //sell or exchange crypto
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
    else if (Currency.isFiat(creditCurrency)) {
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
    else if (Currency.isFiat(debitCurrency)) {
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
    else if (Currency.isFiat(debitCurrency)) {
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
};