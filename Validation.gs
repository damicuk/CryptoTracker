CryptoTracker.prototype.validateLedger = function () {

  let ledgerRecords = this.getLedgerRecords();

  this.validateLedgerRecords(ledgerRecords);

}

CryptoTracker.prototype.validateLedgerRecords = function (ledgerRecords) {

  //try {

    for (let i = 0; i < ledgerRecords.length; i++) {

      let row = i + 3; //row numbers start at 1 plus two header rows

      this.validateLedgerRecord(ledgerRecords[i], row);

    }

  // }
  // catch (err) {

  //   SpreadsheetApp.getUi().alert(`Ledger validation failed`, err.message, SpreadsheetApp.getUi().ButtonSet.OK);
  //   return;

  // }
}

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
    throw Error(`${action} row ${row}: missing date.`);
  }
  else if (isNaN(debitExRate)) {
    throw Error(`${action} row ${row}: debit exchange rate is not valid (number or blank).`);
  }
  else if (isNaN(debitAmount)) {
    throw Error(`${action} row ${row}: debit amount is not valid (number or blank).`);
  }
  else if (isNaN(debitFee)) {
    throw Error(`${action} row ${row}: debit fee is not valid (number or blank).`);
  }
  else if (isNaN(creditExRate)) {
    throw Error(`${action} row ${row}: credit exchange rate is not valid (number or blank).`);
  }
  else if (isNaN(creditAmount)) {
    throw Error(`${action} row ${row}: credit amount is not valid (number or blank).`);
  }
  else if (isNaN(creditFee)) {
    throw Error(`${action} row ${row}: credit fee is not valid (number or blank).`);
  }
  else if (debitCurrency && !this.isFiat(debitCurrency) && !this.isCrypto(debitCurrency)) {
    throw Error(`${action} row ${row}: debit currency (${debitCurrency}) is not recognized - neither fiat (${CryptoTracker.validFiats.join(', ')}) nor crypto (2-9 characters [A-Za-z0-9_]).`);
  }
  else if (creditCurrency && !this.isFiat(creditCurrency) && !this.isCrypto(creditCurrency)) {
    throw Error(`${action} row ${row}: credit currency (${creditCurrency}) is not recognized - neither fiat (${CryptoTracker.validFiats.join(', ')}) nor crypto (2-9 characters [A-Za-z0-9_]).`);
  }
  else if (lotMatching && !CryptoTracker.lotMatchings.includes(lotMatching)) {
    throw Error(`${action} row ${row}: lot matching (${lotMatching}) is not valid (${CryptoTracker.lotMatchings.join(', ')}) or blank.`);
  }
  else if (action == 'Transfer') { //Transfer
    if (!debitCurrency) {
      throw Error(`${action} row ${row}: no debit currency specified.`);
    }
    else if (creditCurrency) {
      throw Error(`${action} row ${row}: leave credit currency (${creditCurrency}) blank. It is inferred from the debit currency (${debitCurrency}).`);
    }
    else if (debitExRate !== '') {
      throw Error(`${action} row ${row}: leave debit exchange rate (${debitExRate}) blank.`);
    }
    else if (debitAmount === '') {
      throw Error(`${action} row ${row}: no debit amount specified.`);
    }
    else if (debitAmount <= 0) {
      throw Error(`${action} row ${row}: debit amount (${debitAmount.toLocaleString()}) must be greater than 0.`);
    }
    else if (debitFee < 0) {
      throw Error(`${action} row ${row}: debit fee (${debitFee.toLocaleString()}) must be greater or equal to 0 (or blank).`);
    }
    else if (creditExRate !== '') {
      throw Error(`${action} row ${row}: leave credit exchange rate (${creditExRate}) blank.`);
    }
    else if (creditAmount !== '') {
      throw Error(`${action} row ${row}: leave credit amount (${creditAmount.toLocaleString()}) blank. It is inferred from the debit amount (${debitAmount.toLocaleString()}) and debit fee (${debitFee.toLocaleString()}).`);
    }
    else if (creditFee !== '') {
      throw Error(`${action} row ${row}: leave credit fee (${creditFee.toLocaleString()}) blank.`);
    }
    else if (!debitWalletName && !creditWalletName) {
      throw Error(`${action} row ${row}: no debit or credit wallet specified.`);
    }
    else if (this.isFiat(debitCurrency)) { //Fiat transfer
      if (debitWalletName && creditWalletName) {
        throw Error(`${action} row ${row}: fiat transfer leave debit wallet (${debitWalletName}) blank for deposits or credit wallet (${creditWalletName}) blank for withdrawals.`);
      }
    }
    else if (this.isCrypto(debitCurrency)) { //Crypto transfer
      if (!debitWalletName) {
        throw Error(`${action} row ${row}: no debit wallet specified.`);
      }
      else if (!creditWalletName) {
        throw Error(`${action} row ${row}: no credit wallet specified.`);
      }
      else if (debitWalletName == creditWalletName) {
        throw Error(`${action} row ${row}: debit wallet (${debitWalletName}) and credit wallet (${creditWalletName}) must be different.`);
      }
    }
  }
  else if (action == 'Trade') { //Trade
    if (!debitCurrency) {
      throw Error(`${action} row ${row}: no debit currency specified.`);
    }
    else if (!creditCurrency) {
      throw Error(`${action} row ${row}: no credit currency specified.`);
    }
    else if (debitCurrency == creditCurrency) {
      throw Error(`${action} row ${row}: debit currency (${debitCurrency}) and credit currency (${creditCurrency}) must be different.`);
    }
    else if (this.isFiat(debitCurrency) && this.isFiat(creditCurrency)) {
      throw Error(`${action} row ${row}: both debit currency (${debitCurrency}) and credit currency (${creditCurrency}) are fiat, not supported.`);
    }
    else if (!debitWalletName) {
      throw Error(`${action} row ${row}: no debit wallet specified.`);
    }
    else if (creditWalletName) {
      throw Error(`${action} row ${row}: leave credit wallet (${creditWalletName}) blank. It is inferred from the debit wallet (${debitWalletName}).`);
    }
    else if (debitAmount === '') {
      throw Error(`${action} row ${row}: no debit amount specified.`);
    }
    else if (debitAmount < 0) {
      throw Error(`${action} row ${row}: debit amount (${debitAmount.toLocaleString()}) must be greater or equal to 0.`);
    }
    else if (debitFee < 0) {
      throw Error(`${action} row ${row}: debit fee (${debitFee.toLocaleString()}) must be greater or equal to 0 (or blank).`);
    }
    else if (creditAmount === '') {
      throw Error(`${action} row ${row}: no credit amount specified.`);
    }
    else if (creditAmount < 0) {
      throw Error(`${action} row ${row}: credit amount (${creditAmount.toLocaleString()}) must be greater or equal to 0.`);
    }
    else if (creditFee < 0) {
      throw Error(`${action} row ${row}: credit fee (${creditFee.toLocaleString()}) must be greater or equal to 0 (or blank).`);
    }
    else if (debitCurrency == this.accountingCurrency && debitExRate !== '') {
      throw Error(`${action} row ${row}: debit currency (${debitCurrency}) is the accounting currency (${this.accountingCurrency}). Leave debit exchange rate (${debitExRate}) blank.`);
    }
    else if (creditCurrency == this.accountingCurrency && creditExRate !== '') {
      throw Error(`${action} row ${row}: credit currency (${creditCurrency}) is the accounting currency (${this.accountingCurrency}). Leave credit exchange rate (${creditExRate}) blank.`);
    }
    else {
      if (this.isCrypto(creditCurrency) && debitCurrency != this.accountingCurrency) { //buy or exchange crypto
        if (debitExRate === '') {
          throw Error(`${action} row ${row}: missing debit currency (${debitCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`);
        }
        else if (debitExRate <= 0) {
          throw Error(`${action} row ${row}: debit exchange rate must be greater than 0.`);
        }
      }
      if (this.isCrypto(debitCurrency) && creditCurrency != this.accountingCurrency) { //sell or exchange crypto
        if (creditExRate === '') {
          throw Error(`${action} row ${row}: missing credit currency (${creditCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`);
        }
        else if (creditExRate <= 0) {
          throw Error(`${action} row ${row}: credit exchange rate must be greater than 0.`);
        }
      }
    }
  }
  else if (action == 'Income') { //Income
    if (debitCurrency) {
      throw Error(`${action} row ${row}: leave debit currency (${debitCurrency}) blank.`);
    }
    else if (debitExRate !== '') {
      throw Error(`${action} row ${row}: leave debit exchange rate (${debitExRate}) blank.`);
    }
    else if (debitAmount !== '') {
      throw Error(`${action} row ${row}: leave debit amount (${debitAmount.toLocaleString()}) blank.`);
    }
    else if (debitFee !== '') {
      throw Error(`${action} row ${row}: leave debit fee (${debitFee.toLocaleString()}) blank.`);
    }
    else if (debitWalletName) {
      throw Error(`${action} row ${row}: leave debit wallet (${debitWalletName}) blank.`);
    }
    else if (!creditCurrency) {
      throw Error(`${action} row ${row}: no credit currency specified.`);
    }
    else if (this.isFiat(creditCurrency)) {
      throw Error(`${action} row ${row}: credit currency (${creditCurrency}) is fiat (${CryptoTracker.validFiats.join(', ')}), not supported.`);
    }
    else if (creditExRate === '') {
      throw Error(`${action} row ${row}: missing credit currency (${creditCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`);
    }
    else if (creditExRate <= 0) {
      throw Error(`${action} row ${row}: credit exchange rate must be greater than 0.`);
    }
    else if (creditAmount === '') {
      throw Error(`${action} row ${row}: no credit amount specified.`);
    }
    else if (creditAmount <= 0) {
      throw Error(`${action} row ${row}: credit amount (${creditAmount.toLocaleString()}) must be greater than 0.`);
    }
    else if (creditFee !== '') {
      throw Error(`${action} row ${row}: leave credit fee (${creditFee.toLocaleString()}) blank.`);
    }
    else if (!creditWalletName) {
      throw Error(`${action} row ${row}: no credit wallet specified.`);
    }
  }
  else if (action == 'Donation' || action == 'Payment') { //Donation or Payment
    if (!debitCurrency) {
      throw Error(`${action} row ${row}: no debit currency specified.`);
    }
    else if (this.isFiat(debitCurrency)) {
      throw Error(`${action} row ${row}: debit currency (${debitCurrency}) is fiat (${CryptoTracker.validFiats.join(', ')}), not supported.`);
    }
    else if (debitExRate === '') {
      throw Error(`${action} row ${row}: missing debit currency (${debitCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`);
    }
    else if (debitExRate <= 0) {
      throw Error(`${action} row ${row}: debit exchange rate must be greater than 0.`);
    }
    else if (debitAmount === '') {
      throw Error(`${action} row ${row}: no debit amount specified.`);
    }
    else if (debitAmount <= 0) {
      throw Error(`${action} row ${row}: debit amount (${debitAmount.toLocaleString()}) must be greater than 0.`);
    }
    else if (debitFee < 0) {
      throw Error(`${action} row ${row}: debit fee (${debitFee.toLocaleString()}) must be greater or equal to 0 (or blank).`);
    }
    else if (!debitWalletName) {
      throw Error(`${action} row ${row}: no debit wallet specified.`);
    }
    else if (creditCurrency) {
      throw Error(`${action} row ${row}: leave credit currency (${creditCurrency}) blank.`);
    }
    else if (creditExRate !== '') {
      throw Error(`${action} row ${row}: leave credit exchange rate (${creditExRate}) blank.`);
    }
    else if (creditAmount !== '') {
      throw Error(`${action} row ${row}: leave credit amount (${creditAmount.toLocaleString()}) blank.`);
    }
    else if (creditFee !== '') {
      throw Error(`${action} row ${row}: leave credit fee (${creditFee.toLocaleString()}) blank.`);
    }
    else if (creditWalletName) {
      throw Error(`${action} row ${row}: leave credit wallet (${creditWalletName}) blank.`);
    }
  }
  else if (action == 'Gift') { //Gift
    if (!debitCurrency) {
      throw Error(`${action} row ${row}: no debit currency specified.`);
    }
    else if (this.isFiat(debitCurrency)) {
      throw Error(`${action} row ${row}: debit currency (${debitCurrency}) is fiat (${CryptoTracker.validFiats.join(', ')}), not supported.`);
    }
    else if (debitExRate !== '') {
      throw Error(`${action} row ${row}: leave debit exchange rate (${debitExRate}) blank.`);
    }
    else if (debitAmount === '') {
      throw Error(`${action} row ${row}: no debit amount specified.`);
    }
    else if (debitAmount <= 0) {
      throw Error(`${action} row ${row}: debit amount (${debitAmount.toLocaleString()}) must be greater than 0.`);
    }
    else if (debitFee < 0) {
      throw Error(`${action} row ${row}: debit fee (${debitFee.toLocaleString()}) must be greater or equal to 0 (or blank).`);
    }
    else if (!debitWalletName) {
      throw Error(`${action} row ${row}: no debit wallet specified.`);
    }
    else if (creditCurrency) {
      throw Error(`${action} row ${row}: leave credit currency (${creditCurrency}) blank.`);
    }
    else if (creditExRate !== '') {
      throw Error(`${action} row ${row}: leave credit exchange rate (${creditExRate}) blank.`);
    }
    else if (creditAmount !== '') {
      throw Error(`${action} row ${row}: leave credit amount (${creditAmount.toLocaleString()}) blank.`);
    }
    else if (creditFee !== '') {
      throw Error(`${action} row ${row}: leave credit fee (${creditFee.toLocaleString()}) blank.`);
    }
    else if (creditWalletName) {
      throw Error(`${action} row ${row}: leave credit wallet (${creditWalletName}) blank.`);
    }
  }
  else {
    throw Error(`Ledger row ${row}: action (${action}) is invalid.`);
  }
}