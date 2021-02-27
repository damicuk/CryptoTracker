CryptoTracker.prototype.validateSettings = function () {

  //cross check fiats and cryptos
  for (let fiat of this.fiats) {
    for (let cyrpto of this.cryptos) {
      if (fiat == cyrpto) {
        throw Error(`Currency (${fiat}) is listed as both fiat (${this.fiats}) and crypto (${this.cryptos}) in the settings sheet.`);
      }
    }
  }

  //check fiat convert is fiat and not crypto
  if (!this.fiatConvert) {
    throw Error(`Fiat Convert is missing from the settings sheet.`);
  }
  else if (!this.isFiat(this.fiatConvert)) {
    throw Error(`Fiat Convert (${this.fiatConvert}) is not listed as fiat (${this.fiats}) in the settings sheet.`);
  }
  else if (this.isCrypto(this.fiatConvert)) { //never called
    throw Error(`Fiat Convert (${this.fiatConvert}) is listed as crypto (${this.cryptos}) in the settings sheet.`);
  }
  else if (!this.ledgerSheetName) {
    throw Error(`Ledger Sheet is missing from the settings sheet.`);
  }
  else if (!this.openPositionsSheetName) {
    throw Error(`Open Positions Sheet is missing from the settings sheet.`);
  }
  else if (!this.closedPositionsSheetName) {
    throw Error(`Closed Positions Sheet is missing from the settings sheet.`);
  }
  else if (!this.fiatAccountsSheetName) {
    throw Error(`Fiat Accounts Sheet is missing from the settings sheet.`);
  }
  else if (!this.cryptoDataSheetName) {
    throw Error(`Crypto Data Sheet is missing from the settings sheet.`);
  }
  else if (this.saveCryptoData && !this.histCryptoSheetName) {
    throw Error(`Historical Crypto Data Sheet is missing from the settings sheet.`);
  }
  else if (!this.defaultLotMatching) {
    throw Error(`Default Lot Matching is missing from the settings sheet.`);
  }
  else if(this.exRateMinutesMargin == null) {
    throw Error(`ExRate Minutes Margin is missing from the settings sheet.`);
  }
  else if(isNaN(this.exRateMinutesMargin)) {
    throw Error(`ExRate Minutes Margin (${this.exRateMinutesMargin}) is not valid (number).`);
  }
  else if(this.exRateMinutesMargin < 0) {
    throw Error(`ExRate Minutes Margin (${this.exRateMinutesMargin}) is must be greater or equal to 0.`);
  }
}

CryptoTracker.prototype.validateLedger = function (checkExRates = true) {

  let ledgerRecords = this.getLedgerRecords();
  this.validateLedgerRecords(ledgerRecords, checkExRates);

}

CryptoTracker.prototype.validateLedgerRecords = function (ledgerRecords, checkExRates = true) {

  for (let ledgerRecord of ledgerRecords) {
    this.validateLedgerRecord(ledgerRecord, checkExRates);
  }
}

CryptoTracker.prototype.validateLedgerRecord = function (ledgerRecord, checkExRates = true) {

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
  let hasDebitExRate = ledgerRecord.hasDebitExRate;
  let hasDebitAmount = ledgerRecord.hasDebitAmount;
  let hasDebitFee = ledgerRecord.hasDebitFee;
  let hasCreditExRate = ledgerRecord.hasCreditExRate;
  let hasCreditAmount = ledgerRecord.hasCreditAmount;
  let hasCreditFee = ledgerRecord.hasCreditFee;

  if (isNaN(date)) {
    throw Error('Ledger record: missing date.');
  }
  else if (isNaN(debitExRate)) {
    throw Error(`[${date.toISOString()}] [${action}] Ledger record debit exchange rate is not valid (number or blank).`);
  }
  else if (isNaN(debitAmount)) {
    throw Error(`[${date.toISOString()}] [${action}] Ledger record debit amount is not valid (number or blank).`);
  }
  else if (isNaN(debitFee)) {
    throw Error(`[${date.toISOString()}] [${action}] Ledger record debit fee is not valid (number or blank).`);
  }
  else if (isNaN(creditExRate)) {
    throw Error(`[${date.toISOString()}] [${action}] Ledger record credit exchange rate is not valid (number or blank).`);
  }
  else if (isNaN(creditAmount)) {
    throw Error(`[${date.toISOString()}] [${action}] Ledger record credit amount is not valid (number or blank).`);
  }
  else if (isNaN(creditFee)) {
    throw Error(`[${date.toISOString()}] [${action}] Ledger record credit fee is not valid (number or blank).`);
  }
  else if (debitCurrency && !this.isFiat(debitCurrency) && !this.isCrypto(debitCurrency)) {
    throw Error(`[${date.toISOString()}] [${action}] Ledger record debit currency (${debitCurrency}) is not recognized - neither fiat (${this.fiats}) nor crypto (${this.cryptos}).`)
  }
  else if (creditCurrency && !this.isFiat(creditCurrency) && !this.isCrypto(creditCurrency)) {
    throw Error(`[${date.toISOString()}] [${action}] Ledger record credit currency (${creditCurrency}) is not recognized - neither fiat (${this.fiats}) nor crypto (${this.cryptos}).`)
  }
  else if (lotMatching && !this.lotMatchingArray.includes(lotMatching)) {
    throw Error(`[${date.toISOString()}] [${action}] Ledger record lot matching (${lotMatching}) is not valid (${this.lotMatchingArray}) or blank.`);
  }
  else if (action == 'Transfer') { //Transfer
    if (!debitCurrency) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with no debit currency specified.`);
    }
    else if (creditCurrency) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit currency (${creditCurrency}) blank. It is inferred from the debit currency (${debitCurrency}).`);
    }
    else if (hasDebitExRate) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit exchange rate (${debitExRate}) blank.`);
    }
    else if (!hasDebitAmount) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with no debit amount specified.`);
    }
    else if (debitAmount <= 0) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record debit amount (${debitAmount.toLocaleString()}) must be greater than 0.`);
    }
    else if (debitFee < 0) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record transfer debit fee (${debitFee.toLocaleString()}) must be greater or equal to 0 (or blank).`);
    }
    else if (hasCreditExRate) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit exchange rate (${creditExRate}) blank.`);
    }
    else if (hasCreditAmount) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave transfer credit amount (${creditAmount.toLocaleString()}) blank. It is inferred from the debit amount (${debitAmount.toLocaleString()}) and debit fee (${debitFee.toLocaleString()}).`);
    }
    else if (hasCreditFee) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit fee (${creditFee.toLocaleString()}) blank.`);
    }
    else if (!debitWalletName && !creditWalletName) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record has no debit or credit wallet specified.`);
    }
    else if (this.isFiat(debitCurrency)) { //Fiat transfer
      if (debitWalletName && creditWalletName) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record fiat transfer leave debit wallet (${debitWalletName}) blank for deposits or credit wallet (${creditWalletName}) blank for withdrawals.`);
      }
    }
    else if (this.isCrypto(debitCurrency)) { //Crypto transfer
      if (!debitWalletName) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record has no debit wallet specified.`);
      }
      else if (!creditWalletName) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record has no credit wallet specified.`);
      }
      else if (debitWalletName == creditWalletName) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record debit wallet (${debitWalletName}) and credit wallet (${creditWalletName}) must be different.`);
      }
    }
  }
  else if (action == 'Trade') { //Trade
    if (!debitCurrency) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with no debit currency specified.`);
    }
    else if (!creditCurrency) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with no credit currency specified.`);
    }
    else if (debitCurrency == creditCurrency) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record debit currency (${debitCurrency}) and credit currency (${creditCurrency}) must be different.`);
    }
    else if (this.isFiat(debitCurrency) && this.isFiat(creditCurrency)) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with both fiat debit currency (${debitCurrency}) and fiat credit currency (${creditCurrency}) not supported.`);
    }
    else if (!debitWalletName) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record has no debit wallet specified.`);
    }
    else if (creditWalletName) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit wallet (${creditWalletName}) blank. It is inferred from the debit wallet (${debitWalletName}).`);
    }
    else if (!hasDebitAmount) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with no debit amount specified.`);
    }
    else if (debitAmount < 0) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record debit amount (${debitAmount.toLocaleString()}) must be greater or equal to 0.`);
    }
    else if (debitFee < 0) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record debit fee (${debitFee.toLocaleString()}) must be greater or equal to 0 (or blank).`);
    }
    else if (!hasCreditAmount) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with no credit amount specified.`);
    }
    else if (creditAmount < 0) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record credit amount (${creditAmount.toLocaleString()}) must be greater or equal to 0.`);
    }
    else if (creditFee < 0) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record credit fee (${creditFee.toLocaleString()}) must be greater or equal to 0 (or blank).`);
    }
    if (debitCurrency == this.fiatConvert && hasDebitExRate) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record debit currency (${debitCurrency}) is fiat convert (${this.fiatConvert}). Leave exchange rate (${debitExRate}) blank.`);
    }
    if (creditCurrency == this.fiatConvert && hasCreditExRate) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record credit currency (${creditCurrency}) is fiat convert (${this.fiatConvert}). Leave exchange rate (${creditExRate}) blank.`);
    }
    else if (checkExRates) {
      if (this.isCrypto(creditCurrency) && debitCurrency != this.fiatConvert) { //buy or exchange crypto
        if (!hasDebitExRate) {
          throw Error(`[${date.toISOString()}] [${action}] Ledger record missing debit currency (${debitCurrency}) fiat convert (${this.fiatConvert}) exchange rate.`);
        }
        else if (debitExRate <= 0) {
          throw Error(`[${date.toISOString()}] [${action}] Ledger record debit exchange rate must be greater than 0.`);
        }
      }
      if (this.isCrypto(debitCurrency) && creditCurrency != this.fiatConvert) { //sell or exchange crypto
        if (!hasCreditExRate) {
          throw Error(`[${date.toISOString()}] [${action}] Ledger record missing credit currency (${creditCurrency}) fiat convert (${this.fiatConvert}) exchange rate.`);
        }
        else if (creditExRate <= 0) {
          throw Error(`[${date.toISOString()}] [${action}] Ledger record credit exchange rate must be greater than 0.`);
        }
      }
    }
  }
  else if (action == 'Reward') { //Reward
    if (debitCurrency) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit currency (${debitCurrency}) blank.`);
    }
    else if (hasDebitExRate) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit exchange rate (${debitExRate}) blank.`);
    }
    else if (hasDebitAmount) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit amount (${debitAmount.toLocaleString()}) blank.`);
    }
    else if (hasDebitFee) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit fee (${debitFee.toLocaleString()}) blank.`);
    }
    else if (debitWalletName) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit wallet (${debitWalletName}) blank.`);
    }
    else if (!creditCurrency) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record has no credit currency specified.`);
    }
    else if (!this.isCrypto(creditCurrency)) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record credit currency (${creditCurrency}) must be crypto (${this.cryptos}).`)
    }
    else if (!hasCreditAmount) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with no credit amount specified.`);
    }
    else if (creditAmount <= 0) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record credit amount (${creditAmount.toLocaleString()}) must be greater than 0.`);
    }
    else if (hasCreditFee) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit fee (${creditFee.toLocaleString()}) blank.`);
    }
    else if (!creditWalletName) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record has no credit wallet specified.`);
    }
    else if (checkExRates) {
      if (!hasCreditExRate) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record missing credit currency (${creditCurrency}) fiat convert (${this.fiatConvert}) exchange rate.`);
      }
      else if (creditExRate <= 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record credit exchange rate must be greater than 0.`);
      }
    }
  }
  else if (action == 'Gift') { //Gift
    if (!debitCurrency) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with no debit currency specified.`);
    }
    else if (!this.isCrypto(debitCurrency)) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record debit currency (${debitCurrency}) must be crypto (${this.cryptos}).`)
    }
    else if (hasDebitExRate) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit exchange rate (${debitExRate}) blank.`);
    }
    else if (!hasDebitAmount) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with no debit amount specified.`);
    }
    else if (debitAmount <= 0) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record debit amount (${debitAmount.toLocaleString()}) must be greater than 0.`);
    }
    else if (debitFee < 0) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record debit fee (${debitFee.toLocaleString()}) must be greater or equal to 0 (or blank).`);
    }
    else if (!debitWalletName) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record has no debit wallet specified.`);
    }
    else if (creditCurrency) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit currency (${creditCurrency}) blank.`);
    }
    else if (hasCreditExRate) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit exchange rate (${creditExRate}) blank.`);
    }
    else if (hasCreditAmount) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit amount (${creditAmount.toLocaleString()}) blank.`);
    }
    else if (hasCreditFee) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit fee (${creditFee.toLocaleString()}) blank.`);
    }
    else if (creditWalletName) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit wallet (${creditWalletName}) blank.`);
    }
  }
  else if (action == 'Fee') { //Fee
    if (!debitCurrency) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with no debit currency specified.`);
    }
    else if (!this.isCrypto(debitCurrency)) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record debit currency (${debitCurrency}) must be crypto (${this.cryptos}).`)
    }
    else if (hasDebitExRate) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit exchange rate (${debitExRate}) blank.`);
    }
    else if (hasDebitAmount) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit amount (${debitAmount.toLocaleString()}) blank.`);
    }
    else if (!hasDebitFee) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record with no debit fee specified.`);
    }
    else if (debitFee <= 0) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record debit fee (${debitFee.toLocaleString()}) must be greater than 0.`);
    }
    else if (!debitWalletName) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record has no debit wallet specified.`);
    }
    else if (creditCurrency) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit currency (${creditCurrency}) blank.`);
    }
    else if (hasCreditExRate) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit exchange rate (${creditExRate}) blank.`);
    }
    else if (hasCreditAmount) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit amount (${creditAmount.toLocaleString()}) blank.`);
    }
    else if (hasCreditFee) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit fee (${creditFee.toLocaleString()}) blank.`);
    }
    else if (creditWalletName) {
      throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit wallet (${creditWalletName}) blank.`);
    }
  }
  else {
    throw Error(`[${date.toISOString()}] Ledger record: action (${action}) is invalid.`);
  }
}

