/**
 * Retrieves and validates the ledger records and displays toast on success
 */
CryptoTracker.prototype.validateLedger = function () {

  let ledgerRecords = this.getLedgerRecords();

  let ledgerValid = this.validateLedgerRecords(ledgerRecords);

  if (ledgerValid) {

    SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);

  }
}

/**
 * Validates a set of ledger records and handles validation errors
 * @param {LedgerRecord[]} ledgerRecords - The colection of ledger records to validate
 * @return {boolean} Whether the ledger records are valid
 */
CryptoTracker.prototype.validateLedgerRecords = function (ledgerRecords) {

  try {

    //row numbers start at 1 plus two header rows
    let row = 3;

    for (let ledgerRecord of ledgerRecords) {

      this.validateLedgerRecord(ledgerRecord, row++);

    }

  }
  catch (error) {

    if (error instanceof ValidationError) {

      this.handleError('validation', error.message, error.rowIndex, error.columnName);
      return false;
    }
    else {

      throw error;
    }
  }
  return true;
}

/**
 * Validates a ledger record and throws a validation error on failure
 * @param {LedgerRecord} ledgerRecord - The ledger record to validate
 */
CryptoTracker.prototype.validateLedgerRecord = function (ledgerRecord, row) {

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
    throw new ValidationError(`${action} row ${row}: missing date.`, row, 'date');
  }
  if (action === '') {
    throw new ValidationError(`Ledger row ${row}: no action specified.`, row, 'action');
  }
  else if (debitCurrency && !this.isFiat(debitCurrency) && !this.isCrypto(debitCurrency)) {
    throw new ValidationError(`${action} row ${row}: debit currency (${debitCurrency}) is not recognized - neither fiat (${CryptoTracker.validFiats.join(', ')}) nor crypto (2-9 characters [A-Za-z0-9_]).`, row, 'debitCurrency');
  }
  else if (isNaN(debitExRate)) {
    throw new ValidationError(`${action} row ${row}: debit exchange rate is not valid (number or blank).`, row, 'debitExRate');
  }
  else if (isNaN(debitAmount)) {
    throw new ValidationError(`${action} row ${row}: debit amount is not valid (number or blank).`, row, 'debitAmount');
  }
  else if (isNaN(debitFee)) {
    throw new ValidationError(`${action} row ${row}: debit fee is not valid (number or blank).`, row, 'debitFee');
  }
  else if (creditCurrency && !this.isFiat(creditCurrency) && !this.isCrypto(creditCurrency)) {
    throw new ValidationError(`${action} row ${row}: credit currency (${creditCurrency}) is not recognized - neither fiat (${CryptoTracker.validFiats.join(', ')}) nor crypto (2-9 characters [A-Za-z0-9_]).`, row, 'creditCurrency');
  }
  else if (isNaN(creditExRate)) {
    throw new ValidationError(`${action} row ${row}: credit exchange rate is not valid (number or blank).`, row, 'creditExRate');
  }
  else if (isNaN(creditAmount)) {
    throw new ValidationError(`${action} row ${row}: credit amount is not valid (number or blank).`, row, 'creditAmount');
  }
  else if (isNaN(creditFee)) {
    throw new ValidationError(`${action} row ${row}: credit fee is not valid (number or blank).`, row, 'creditFee');
  }
  else if (lotMatching && !CryptoTracker.lotMatchings.includes(lotMatching)) {
    throw new ValidationError(`${action} row ${row}: lot matching (${lotMatching}) is not valid (${CryptoTracker.lotMatchings.join(', ')}) or blank.`, row, 'lotMatching');
  }
  else if (action === 'Transfer') { //Transfer
    if (!debitCurrency) {
      throw new ValidationError(`${action} row ${row}: no debit currency specified.`, row, 'debitCurrency');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${row}: leave debit exchange rate blank.`, row, 'debitExRate');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${row}: no debit amount specified.`, row, 'debitAmount');
    }
    else if (debitAmount <= 0) {
      throw new ValidationError(`${action} row ${row}: debit amount must be greater than 0.`, row, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${row}: debit fee must be greater or equal to 0 (or blank).`, row, 'debitFee');
    }
    else if (creditCurrency) {
      throw new ValidationError(`${action} row ${row}: leave credit currency (${creditCurrency}) blank. It is inferred from the debit currency (${debitCurrency}).`, row, 'creditCurrency');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${row}: leave credit exchange rate blank.`, row, 'creditExRate');
    }
    else if (creditAmount !== '') {
      throw new ValidationError(`${action} row ${row}: leave credit amount blank. It is inferred from the debit amount and debit fee.`, row, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${row}: leave credit fee blank.`, row, 'creditFee');
    }
    else if (!debitWalletName && !creditWalletName) {
      throw new ValidationError(`${action} row ${row}: no debit or credit wallet specified.`, row, 'debitWalletName');
    }
    else if (this.isFiat(debitCurrency)) { //Fiat transfer
      if (debitWalletName && creditWalletName) {
        throw new ValidationError(`${action} row ${row}: fiat transfer leave debit wallet (${debitWalletName}) blank for deposits or credit wallet (${creditWalletName}) blank for withdrawals.`, row, 'debitWalletName');
      }
    }
    else if (this.isCrypto(debitCurrency)) { //Crypto transfer
      if (!debitWalletName) {
        throw new ValidationError(`${action} row ${row}: no debit wallet specified.`, row, 'debitWalletName');
      }
      else if (!creditWalletName) {
        throw new ValidationError(`${action} row ${row}: no credit wallet specified.`, row, 'creditWalletName');
      }
      else if (debitWalletName === creditWalletName) {
        throw new ValidationError(`${action} row ${row}: debit wallet (${debitWalletName}) and credit wallet (${creditWalletName}) must be different.`, row, 'debitWalletName');
      }
    }
  }
  else if (action === 'Trade') { //Trade
    if (!debitCurrency) {
      throw new ValidationError(`${action} row ${row}: no debit currency specified.`, row, 'debitCurrency');
    }
    else if (!creditCurrency) {
      throw new ValidationError(`${action} row ${row}: no credit currency specified.`, row, 'creditCurrency');
    }
    else if (debitCurrency === creditCurrency) {
      throw new ValidationError(`${action} row ${row}: debit currency (${debitCurrency}) and credit currency (${creditCurrency}) must be different.`, row, 'debitCurrency');
    }
    else if (this.isFiat(debitCurrency) && this.isFiat(creditCurrency)) {
      throw new ValidationError(`${action} row ${row}: both debit currency (${debitCurrency}) and credit currency (${creditCurrency}) are fiat, not supported.`, row, 'debitCurrency');
    }
    else if (!debitWalletName) {
      throw new ValidationError(`${action} row ${row}: no debit wallet specified.`, row, 'debitWalletName');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${row}: no debit amount specified.`, row, 'debitAmount');
    }
    else if (debitAmount < 0) {
      throw new ValidationError(`${action} row ${row}: debit amount must be greater or equal to 0.`, row, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${row}: debit fee must be greater or equal to 0 (or blank).`, row, 'debitFee');
    }
    else if (creditAmount === '') {
      throw new ValidationError(`${action} row ${row}: no credit amount specified.`, row, 'creditAmount');
    }
    else if (creditAmount < 0) {
      throw new ValidationError(`${action} row ${row}: credit amount must be greater or equal to 0.`, row, 'creditAmount');
    }
    else if (creditFee < 0) {
      throw new ValidationError(`${action} row ${row}: credit fee must be greater or equal to 0 (or blank).`, row, 'creditFee');
    }
    else if (creditWalletName) {
      throw new ValidationError(`${action} row ${row}: leave credit wallet (${creditWalletName}) blank. It is inferred from the debit wallet (${debitWalletName}).`, row, 'creditWalletName');
    }
    else if (debitCurrency === this.accountingCurrency && debitExRate !== '') {
      throw new ValidationError(`${action} row ${row}: debit currency (${debitCurrency}) is the accounting currency (${this.accountingCurrency}). Leave debit exchange rate blank.`, row, 'debitExRate');
    }
    else if (creditCurrency === this.accountingCurrency && creditExRate !== '') {
      throw new ValidationError(`${action} row ${row}: credit currency (${creditCurrency}) is the accounting currency (${this.accountingCurrency}). Leave credit exchange rate blank.`, row, 'creditExRate');
    }
    else {
      if (this.isCrypto(creditCurrency) && debitCurrency != this.accountingCurrency) { //buy or exchange crypto
        if (debitExRate === '') {
          throw new ValidationError(`${action} row ${row}: missing debit currency (${debitCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, row, 'debitExRate');
        }
        else if (debitExRate <= 0) {
          throw new ValidationError(`${action} row ${row}: debit exchange rate must be greater than 0.`, row, 'debitExRate');
        }
      }
      if (this.isCrypto(debitCurrency) && creditCurrency != this.accountingCurrency) { //sell or exchange crypto
        if (creditExRate === '') {
          throw new ValidationError(`${action} row ${row}: missing credit currency (${creditCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, row, 'creditExRate');
        }
        else if (creditExRate <= 0) {
          throw new ValidationError(`${action} row ${row}: credit exchange rate must be greater than 0.`, row, 'creditExRate');
        }
      }
    }
  }
  else if (action === 'Income') { //Income
    if (debitCurrency) {
      throw new ValidationError(`${action} row ${row}: leave debit currency (${debitCurrency}) blank.`, row, 'debitCurrency');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${row}: leave debit exchange rate blank.`, row, 'debitExRate');
    }
    else if (debitAmount !== '') {
      throw new ValidationError(`${action} row ${row}: leave debit amount blank.`, row, 'debitAmount');
    }
    else if (debitFee !== '') {
      throw new ValidationError(`${action} row ${row}: leave debit fee blank.`, row, 'debitFee');
    }
    else if (debitWalletName) {
      throw new ValidationError(`${action} row ${row}: leave debit wallet (${debitWalletName}) blank.`, row, 'debitWalletName');
    }
    else if (!creditCurrency) {
      throw new ValidationError(`${action} row ${row}: no credit currency specified.`, row, 'creditCurrency');
    }
    else if (this.isFiat(creditCurrency)) {
      throw new ValidationError(`${action} row ${row}: credit currency (${creditCurrency}) is fiat, not supported.`, row, 'creditCurrency');
    }
    else if (creditExRate === '') {
      throw new ValidationError(`${action} row ${row}: missing credit currency (${creditCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, row, 'creditExRate');
    }
    else if (creditExRate <= 0) {
      throw new ValidationError(`${action} row ${row}: credit exchange rate must be greater than 0.`, row, 'creditExRate');
    }
    else if (creditAmount === '') {
      throw new ValidationError(`${action} row ${row}: no credit amount specified.`, row, 'creditAmount');
    }
    else if (creditAmount <= 0) {
      throw new ValidationError(`${action} row ${row}: credit amount must be greater than 0.`, row, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${row}: leave credit fee blank.`, row, 'creditFee');
    }
    else if (!creditWalletName) {
      throw new ValidationError(`${action} row ${row}: no credit wallet specified.`, row, 'creditWalletName');
    }
  }
  else if (action === 'Donation' || action === 'Payment') { //Donation or Payment
    if (!debitCurrency) {
      throw new ValidationError(`${action} row ${row}: no debit currency specified.`, row, 'debitCurrency');
    }
    else if (this.isFiat(debitCurrency)) {
      throw new ValidationError(`${action} row ${row}: debit currency (${debitCurrency}) is fiat, not supported.`, row, 'debitCurrency');
    }
    else if (debitExRate === '') {
      throw new ValidationError(`${action} row ${row}: missing debit currency (${debitCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, row, 'debitExRate');
    }
    else if (debitExRate <= 0) {
      throw new ValidationError(`${action} row ${row}: debit exchange rate must be greater than 0.`, row, 'debitExRate');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${row}: no debit amount specified.`, row, 'debitAmount');
    }
    else if (debitAmount <= 0) {
      throw new ValidationError(`${action} row ${row}: debit amount must be greater than 0.`, row, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${row}: debit fee must be greater or equal to 0 (or blank).`, row, 'debitFee');
    }
    else if (!debitWalletName) {
      throw new ValidationError(`${action} row ${row}: no debit wallet specified.`, row, 'debitWalletName');
    }
    else if (creditCurrency) {
      throw new ValidationError(`${action} row ${row}: leave credit currency (${creditCurrency}) blank.`, row, 'creditCurrency');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${row}: leave credit exchange rate blank.`, row, 'creditExRate');
    }
    else if (creditAmount !== '') {
      throw new ValidationError(`${action} row ${row}: leave credit amount blank.`, row, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${row}: leave credit fee blank.`, row, 'creditFee');
    }
    else if (creditWalletName) {
      throw new ValidationError(`${action} row ${row}: leave credit wallet (${creditWalletName}) blank.`, row, 'creditWalletName');
    }
  }
  else if (action === 'Gift') { //Gift
    if (!debitCurrency) {
      throw new ValidationError(`${action} row ${row}: no debit currency specified.`, row, 'debitCurrency');
    }
    else if (this.isFiat(debitCurrency)) {
      throw new ValidationError(`${action} row ${row}: debit currency (${debitCurrency}) is fiat, not supported.`, row, 'debitCurrency');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${row}: leave debit exchange rate blank.`, row, 'debitExRate');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${row}: no debit amount specified.`, row, 'debitAmount');
    }
    else if (debitAmount <= 0) {
      throw new ValidationError(`${action} row ${row}: debit amount must be greater than 0.`, row, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${row}: debit fee must be greater or equal to 0 (or blank).`, row, 'debitFee');
    }
    else if (!debitWalletName) {
      throw new ValidationError(`${action} row ${row}: no debit wallet specified.`, row, 'debitWalletName');
    }
    else if (creditCurrency) {
      throw new ValidationError(`${action} row ${row}: leave credit currency (${creditCurrency}) blank.`, row, 'creditCurrency');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${row}: leave credit exchange rate blank.`, row, 'creditExRate');
    }
    else if (creditAmount !== '') {
      throw new ValidationError(`${action} row ${row}: leave credit amount blank.`, row, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${row}: leave credit fee blank.`, row, 'creditFee');
    }
    else if (creditWalletName) {
      throw new ValidationError(`${action} row ${row}: leave credit wallet (${creditWalletName}) blank.`, row, 'creditWalletName');
    }
  }
  else {
    throw new ValidationError(`Ledger row ${row}: action (${action}) is invalid.`, row, 'action');
  }
}