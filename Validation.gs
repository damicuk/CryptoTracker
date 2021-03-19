CryptoTracker.prototype.validateLedger = function () {

  let ledgerRecords = this.getLedgerRecords();

  let ledgerValid = this.validateLedgerRecords(ledgerRecords);

  if (ledgerValid) {

    SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);

  }
}

CryptoTracker.prototype.validateLedgerRecords = function (ledgerRecords) {

  for (let i = 0; i < ledgerRecords.length; i++) {

    let row = i + 3; //row numbers start at 1 plus two header rows

    let recordValid = this.validateLedgerRecord(ledgerRecords[i], row);

    if (!recordValid) {

      return false;
    }

  }

  return true;
}

CryptoTracker.prototype.validateLedgerRecord = function (ledgerRecord, row, columns) {

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
    this.handleError('validation', `${action} row ${row}: missing date.`, row, 'date');
    return false;
  }
  else if (debitCurrency && !this.isFiat(debitCurrency) && !this.isCrypto(debitCurrency)) {
    this.handleError('validation', `${action} row ${row}: debit currency (${debitCurrency}) is not recognized - neither fiat (${CryptoTracker.validFiats.join(', ')}) nor crypto (2-9 characters [A-Za-z0-9_]).`, row, 'debitCurrency');
    return false;
  }
  else if (isNaN(debitExRate)) {
    this.handleError('validation', `${action} row ${row}: debit exchange rate is not valid (number or blank).`, row, 'debitExRate');
    return false;
  }
  else if (isNaN(debitAmount)) {
    this.handleError('validation', `${action} row ${row}: debit amount is not valid (number or blank).`, row, 'debitAmount');
    return false;
  }
  else if (isNaN(debitFee)) {
    this.handleError('validation', `${action} row ${row}: debit fee is not valid (number or blank).`, row, 'debitFee');
    return false;
  }
  else if (creditCurrency && !this.isFiat(creditCurrency) && !this.isCrypto(creditCurrency)) {
    this.handleError('validation', `${action} row ${row}: credit currency (${creditCurrency}) is not recognized - neither fiat (${CryptoTracker.validFiats.join(', ')}) nor crypto (2-9 characters [A-Za-z0-9_]).`, row, 'creditCurrency');
    return false;
  }
  else if (isNaN(creditExRate)) {
    this.handleError('validation', `${action} row ${row}: credit exchange rate is not valid (number or blank).`, row, 'creditExRate');
    return false;
  }
  else if (isNaN(creditAmount)) {
    this.handleError('validation', `${action} row ${row}: credit amount is not valid (number or blank).`, row, 'creditAmount');
    return false;
  }
  else if (isNaN(creditFee)) {
    this.handleError('validation', `${action} row ${row}: credit fee is not valid (number or blank).`, row, 'creditFee');
    return false;
  }
  else if (lotMatching && !CryptoTracker.lotMatchings.includes(lotMatching)) {
    this.handleError('validation', `${action} row ${row}: lot matching (${lotMatching}) is not valid (${CryptoTracker.lotMatchings.join(', ')}) or blank.`, row, 'lotMatching');
    return false;
  }
  else if (action === 'Transfer') { //Transfer
    if (!debitCurrency) {
      this.handleError('validation', `${action} row ${row}: no debit currency specified.`, row, 'debitCurrency');
      return false;
    }
    else if (debitExRate !== '') {
      this.handleError('validation', `${action} row ${row}: leave debit exchange rate blank.`, row, 'debitExRate');
      return false;
    }
    else if (debitAmount === '') {
      this.handleError('validation', `${action} row ${row}: no debit amount specified.`, row, 'debitAmount');
      return false;
    }
    else if (debitAmount <= 0) {
      this.handleError('validation', `${action} row ${row}: debit amount must be greater than 0.`, row, 'debitAmount');
      return false;
    }
    else if (debitFee < 0) {
      this.handleError('validation', `${action} row ${row}: debit fee must be greater or equal to 0 (or blank).`, row, 'debitFee');
      return false;
    }
    else if (creditCurrency) {
      this.handleError('validation', `${action} row ${row}: leave credit currency (${creditCurrency}) blank. It is inferred from the debit currency (${debitCurrency}).`, row, 'creditCurrency');
      return false;
    }
    else if (creditExRate !== '') {
      this.handleError('validation', `${action} row ${row}: leave credit exchange rate blank.`, row, 'creditExRate');
      return false;
    }
    else if (creditAmount !== '') {
      this.handleError('validation', `${action} row ${row}: leave credit amount blank. It is inferred from the debit amount and debit fee.`, row, 'creditAmount');
      return false;
    }
    else if (creditFee !== '') {
      this.handleError('validation', `${action} row ${row}: leave credit fee blank.`, row, 'creditFee');
      return false;
    }
    else if (!debitWalletName && !creditWalletName) {
      this.handleError('validation', `${action} row ${row}: no debit or credit wallet specified.`, row, 'debitWalletName');
      return false;
    }
    else if (this.isFiat(debitCurrency)) { //Fiat transfer
      if (debitWalletName && creditWalletName) {
        this.handleError('validation', `${action} row ${row}: fiat transfer leave debit wallet (${debitWalletName}) blank for deposits or credit wallet (${creditWalletName}) blank for withdrawals.`, row, 'debitWalletName');
        return false;
      }
    }
    else if (this.isCrypto(debitCurrency)) { //Crypto transfer
      if (!debitWalletName) {
        this.handleError('validation', `${action} row ${row}: no debit wallet specified.`, row, 'debitWalletName');
        return false;
      }
      else if (!creditWalletName) {
        this.handleError('validation', `${action} row ${row}: no credit wallet specified.`, row, 'creditWalletName');
        return false;
      }
      else if (debitWalletName === creditWalletName) {
        this.handleError('validation', `${action} row ${row}: debit wallet (${debitWalletName}) and credit wallet (${creditWalletName}) must be different.`, row, 'debitWalletName');
        return false;
      }
    }
  }
  else if (action === 'Trade') { //Trade
    if (!debitCurrency) {
      this.handleError('validation', `${action} row ${row}: no debit currency specified.`, row, 'debitCurrency');
      return false;
    }
    else if (!creditCurrency) {
      this.handleError('validation', `${action} row ${row}: no credit currency specified.`, row, 'creditCurrency');
      return false;
    }
    else if (debitCurrency === creditCurrency) {
      this.handleError('validation', `${action} row ${row}: debit currency (${debitCurrency}) and credit currency (${creditCurrency}) must be different.`, row, 'debitCurrency');
      return false;
    }
    else if (this.isFiat(debitCurrency) && this.isFiat(creditCurrency)) {
      this.handleError('validation', `${action} row ${row}: both debit currency (${debitCurrency}) and credit currency (${creditCurrency}) are fiat, not supported.`, row, 'debitCurrency');
      return false;
    }
    else if (!debitWalletName) {
      this.handleError('validation', `${action} row ${row}: no debit wallet specified.`, row, 'debitWalletName');
      return false;
    }
    else if (debitAmount === '') {
      this.handleError('validation', `${action} row ${row}: no debit amount specified.`, row, 'debitAmount');
      return false;
    }
    else if (debitAmount < 0) {
      this.handleError('validation', `${action} row ${row}: debit amount must be greater or equal to 0.`, row, 'debitAmount');
      return false;
    }
    else if (debitFee < 0) {
      this.handleError('validation', `${action} row ${row}: debit fee must be greater or equal to 0 (or blank).`, row, 'debitFee');
      return false;
    }
    else if (creditAmount === '') {
      this.handleError('validation', `${action} row ${row}: no credit amount specified.`, row, 'creditAmount');
      return false;
    }
    else if (creditAmount < 0) {
      this.handleError('validation', `${action} row ${row}: credit amount must be greater or equal to 0.`, row, 'creditAmount');
      return false;
    }
    else if (creditFee < 0) {
      this.handleError('validation', `${action} row ${row}: credit fee must be greater or equal to 0 (or blank).`, row, 'creditFee');
      return false;
    }
    else if (creditWalletName) {
      this.handleError('validation', `${action} row ${row}: leave credit wallet (${creditWalletName}) blank. It is inferred from the debit wallet (${debitWalletName}).`, row, 'creditWalletName');
      return false;
    }
    else if (debitCurrency === this.accountingCurrency && debitExRate !== '') {
      this.handleError('validation', `${action} row ${row}: debit currency (${debitCurrency}) is the accounting currency (${this.accountingCurrency}). Leave debit exchange rate blank.`, row, 'debitExRate');
      return false;
    }
    else if (creditCurrency === this.accountingCurrency && creditExRate !== '') {
      this.handleError('validation', `${action} row ${row}: credit currency (${creditCurrency}) is the accounting currency (${this.accountingCurrency}). Leave credit exchange rate blank.`, row, 'creditExRate');
      return false;
    }
    else {
      if (this.isCrypto(creditCurrency) && debitCurrency != this.accountingCurrency) { //buy or exchange crypto
        if (debitExRate === '') {
          this.handleError('validation', `${action} row ${row}: missing debit currency (${debitCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, row, 'debitExRate');
          return false;
        }
        else if (debitExRate <= 0) {
          this.handleError('validation', `${action} row ${row}: debit exchange rate must be greater than 0.`, row, 'debitExRate');
          return false;
        }
      }
      if (this.isCrypto(debitCurrency) && creditCurrency != this.accountingCurrency) { //sell or exchange crypto
        if (creditExRate === '') {
          this.handleError('validation', `${action} row ${row}: missing credit currency (${creditCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, row, 'creditExRate');
          return false;
        }
        else if (creditExRate <= 0) {
          this.handleError('validation', `${action} row ${row}: credit exchange rate must be greater than 0.`, row, 'creditExRate');
          return false;
        }
      }
    }
  }
  else if (action === 'Income') { //Income
    if (debitCurrency) {
      this.handleError('validation', `${action} row ${row}: leave debit currency (${debitCurrency}) blank.`, row, 'debitCurrency');
      return false;
    }
    else if (debitExRate !== '') {
      this.handleError('validation', `${action} row ${row}: leave debit exchange rate blank.`, row, 'debitExRate');
      return false;
    }
    else if (debitAmount !== '') {
      this.handleError('validation', `${action} row ${row}: leave debit amount blank.`, row, 'debitAmount');
      return false;
    }
    else if (debitFee !== '') {
      this.handleError('validation', `${action} row ${row}: leave debit fee blank.`, row, 'debitFee');
      return false;
    }
    else if (debitWalletName) {
      this.handleError('validation', `${action} row ${row}: leave debit wallet (${debitWalletName}) blank.`, row, 'debitWalletName');
      return false;
    }
    else if (!creditCurrency) {
      this.handleError('validation', `${action} row ${row}: no credit currency specified.`, row, 'creditCurrency');
      return false;
    }
    else if (this.isFiat(creditCurrency)) {
      this.handleError('validation', `${action} row ${row}: credit currency (${creditCurrency}) is fiat, not supported.`, row, 'creditCurrency');
      return false;
    }
    else if (creditExRate === '') {
      this.handleError('validation', `${action} row ${row}: missing credit currency (${creditCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, row, 'creditExRate');
      return false;
    }
    else if (creditExRate <= 0) {
      this.handleError('validation', `${action} row ${row}: credit exchange rate must be greater than 0.`, row, 'creditExRate');
      return false;
    }
    else if (creditAmount === '') {
      this.handleError('validation', `${action} row ${row}: no credit amount specified.`, row, 'creditAmount');
      return false;
    }
    else if (creditAmount <= 0) {
      this.handleError('validation', `${action} row ${row}: credit amount must be greater than 0.`, row, 'creditAmount');
      return false;
    }
    else if (creditFee !== '') {
      this.handleError('validation', `${action} row ${row}: leave credit fee blank.`, row, 'creditFee');
      return false;
    }
    else if (!creditWalletName) {
      this.handleError('validation', `${action} row ${row}: no credit wallet specified.`, row, 'creditWalletName');
      return false;
    }
  }
  else if (action === 'Donation' || action === 'Payment') { //Donation or Payment
    if (!debitCurrency) {
      this.handleError('validation', `${action} row ${row}: no debit currency specified.`, row, 'debitCurrency');
      return false;
    }
    else if (this.isFiat(debitCurrency)) {
      this.handleError('validation', `${action} row ${row}: debit currency (${debitCurrency}) is fiat, not supported.`, row, 'debitCurrency');
      return false;
    }
    else if (debitExRate === '') {
      this.handleError('validation', `${action} row ${row}: missing debit currency (${debitCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, row, 'debitExRate');
      return false;
    }
    else if (debitExRate <= 0) {
      this.handleError('validation', `${action} row ${row}: debit exchange rate must be greater than 0.`, row, 'debitExRate');
      return false;
    }
    else if (debitAmount === '') {
      this.handleError('validation', `${action} row ${row}: no debit amount specified.`, row, 'debitAmount');
      return false;
    }
    else if (debitAmount <= 0) {
      this.handleError('validation', `${action} row ${row}: debit amount must be greater than 0.`, row, 'debitAmount');
      return false;
    }
    else if (debitFee < 0) {
      this.handleError('validation', `${action} row ${row}: debit fee must be greater or equal to 0 (or blank).`, row, 'debitFee');
      return false;
    }
    else if (!debitWalletName) {
      this.handleError('validation', `${action} row ${row}: no debit wallet specified.`, row, 'debitWalletName');
      return false;
    }
    else if (creditCurrency) {
      this.handleError('validation', `${action} row ${row}: leave credit currency (${creditCurrency}) blank.`, row, 'creditCurrency');
      return false;
    }
    else if (creditExRate !== '') {
      this.handleError('validation', `${action} row ${row}: leave credit exchange rate blank.`, row, 'creditExRate');
      return false;
    }
    else if (creditAmount !== '') {
      this.handleError('validation', `${action} row ${row}: leave credit amount blank.`, row, 'creditAmount');
      return false;
    }
    else if (creditFee !== '') {
      this.handleError('validation', `${action} row ${row}: leave credit fee blank.`, row, 'creditFee');
      return false;
    }
    else if (creditWalletName) {
      this.handleError('validation', `${action} row ${row}: leave credit wallet (${creditWalletName}) blank.`, row, 'creditWalletName');
      return false;
    }
  }
  else if (action === 'Gift') { //Gift
    if (!debitCurrency) {
      this.handleError('validation', `${action} row ${row}: no debit currency specified.`, row, 'debitCurrency');
      return false;
    }
    else if (this.isFiat(debitCurrency)) {
      this.handleError('validation', `${action} row ${row}: debit currency (${debitCurrency}) is fiat, not supported.`, row, 'debitCurrency');
      return false;
    }
    else if (debitExRate !== '') {
      this.handleError('validation', `${action} row ${row}: leave debit exchange rate blank.`, row, 'debitExRate');
      return false;
    }
    else if (debitAmount === '') {
      this.handleError('validation', `${action} row ${row}: no debit amount specified.`, row, 'debitAmount');
      return false;
    }
    else if (debitAmount <= 0) {
      this.handleError('validation', `${action} row ${row}: debit amount must be greater than 0.`, row, 'debitAmount');
      return false;
    }
    else if (debitFee < 0) {
      this.handleError('validation', `${action} row ${row}: debit fee must be greater or equal to 0 (or blank).`, row, 'debitFee');
      return false;
    }
    else if (!debitWalletName) {
      this.handleError('validation', `${action} row ${row}: no debit wallet specified.`, row, 'debitWalletName');
      return false;
    }
    else if (creditCurrency) {
      this.handleError('validation', `${action} row ${row}: leave credit currency (${creditCurrency}) blank.`, row, 'creditCurrency');
      return false;
    }
    else if (creditExRate !== '') {
      this.handleError('validation', `${action} row ${row}: leave credit exchange rate blank.`, row, 'creditExRate');
      return false;
    }
    else if (creditAmount !== '') {
      this.handleError('validation', `${action} row ${row}: leave credit amount blank.`, row, 'creditAmount');
      return false;
    }
    else if (creditFee !== '') {
      this.handleError('validation', `${action} row ${row}: leave credit fee blank.`, row, 'creditFee');
      return false;
    }
    else if (creditWalletName) {
      this.handleError('validation', `${action} row ${row}: leave credit wallet (${creditWalletName}) blank.`, row, 'creditWalletName');
      return false;
    }
  }
  else {
    this.handleError('validation', `Ledger row ${row}: action (${action}) is invalid.`, row, 'action');
    return false;
  }
  return true;
}