/**
 * Processes the ledger records.
 * It treats the ledger as a set of instuctions and simulates the actions specified.
 * Stops reading if it encounters the stop action.
 * @param {LedgerRecord[]} ledgerRecords - The collection of ledger records.
 */
CryptoTracker.prototype.processLedger = function (ledgerRecords) {

  if (LedgerRecord.inReverseOrder(ledgerRecords)) {

    ledgerRecords = ledgerRecords.slice().reverse();
    let rowIndex = this.ledgerHeaderRows + ledgerRecords.length;
    for (let ledgerRecord of ledgerRecords) {
      if (ledgerRecord.action === 'Stop') {
        break;
      }
      this.processLedgerRecord(ledgerRecord, rowIndex--);
    }
  }
  else {
    let rowIndex = this.ledgerHeaderRows + 1;
    for (let ledgerRecord of ledgerRecords) {
      if (ledgerRecord.action === 'Stop') {
        break;
      }
      this.processLedgerRecord(ledgerRecord, rowIndex++);
    }
  }
};

/**
 * Processes a ledger record.
 * It treats the ledger record as an instuction and simulates the action specified.
 * @param {LedgerRecord} ledgerRecord - The ledger record to process.
 * @param {number} rowIndex - The index of the row in the ledger sheet used to set the current cell in case of an error.
 */
CryptoTracker.prototype.processLedgerRecord = function (ledgerRecord, rowIndex) {

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

  if (lotMatching) {
    this.lotMatching = lotMatching;
  }

  if (action === 'Transfer') {  //Transfer

    if (Currency.isFiat(debitCurrency)) { //Fiat transfer

      if (debitWalletName) { //Fiat withdrawal

        this.getWallet(debitWalletName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);

      }
      else if (creditWalletName) { //Fiat deposit

        this.getWallet(creditWalletName).getFiatAccount(debitCurrency).transfer(debitAmount).transfer(-debitFee);

      }
    }
    else if (Currency.isCrypto(debitCurrency)) {  //Crypto transfer

      let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

      this.getWallet(creditWalletName).getCryptoAccount(debitCurrency).deposit(lots);

    }
  }
  else if (action === 'Trade') { //Trade

    if (Currency.isFiat(debitCurrency) && Currency.isCrypto(creditCurrency)) {  //Buy crypto

      this.getWallet(debitWalletName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);

      let lot = new Lot(date, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee, debitWalletName);

      this.getWallet(debitWalletName).getCryptoAccount(creditCurrency).deposit(lot);

    }
    else if (Currency.isCrypto(debitCurrency) && Currency.isFiat(creditCurrency)) { //Sell crypto

      let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

      this.closeLots(lots, date, creditCurrency, creditExRate, creditAmount, creditFee, debitWalletName);

      this.getWallet(debitWalletName).getFiatAccount(creditCurrency).transfer(creditAmount).transfer(-creditFee);

    }
    else if (Currency.isCrypto(debitCurrency) && Currency.isCrypto(creditCurrency)) { //Exchange cyrptos

      let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

      this.closeLots(lots, date, creditCurrency, creditExRate, creditAmount, creditFee, debitWalletName);

      let lot = new Lot(date, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee, debitWalletName);

      this.getWallet(debitWalletName).getCryptoAccount(creditCurrency).deposit(lot);

    }
  }
  else if (action === 'Income') { //Income

    //the cost base is the value of (credit exchange rate x credit amount)
    let lot = new Lot(date, creditCurrency, creditExRate, creditAmount, 0, creditCurrency, creditAmount, 0, creditWalletName);

    this.getWallet(creditWalletName).getCryptoAccount(creditCurrency).deposit(lot);

    //keep track of income separately
    this.incomeLots.push(lot.duplicate());

  }
  else if (action === 'Donation') { //Donation

    let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

    this.donateLots(lots, date, debitExRate, debitWalletName);

  }
  else if (action === 'Gift') { //Gift

    this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

  }
  else if (action === 'Fee') { //Fee

    this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(0, debitFee, this.lotMatching, rowIndex);

  }
};
