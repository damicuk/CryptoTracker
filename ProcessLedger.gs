/**
 * Retrieves and validates and processes the ledger records.
 * It treats the ledger as a set of instuctions and simulates the actions specified.
 * Uses the error handler to handle CryptoAccountError thrown on withdraw from an account with insufficient funds.
 * @return {boolean} Successful completion.
 */
CryptoTracker.prototype.processLedger = function (ledgerRecords) {

  //ledger sheet row numbers start at 1 plus two header rows
  let rowIndex = 3;
  for (let ledgerRecord of ledgerRecords) {
    this.processLedgerRecord(ledgerRecord, rowIndex++);
  }
};

/**
 * Processes a ledger record.
 * It treats the ledger record an instuction and simulates the action specified.
 * @param {LedgerRecord} ledgerRecord - The ledger record to process.
 * @param {rowIndex} rowIndex - The index of the row in the ledger sheet used to set the current cell in case of an error.
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

    if (CryptoTracker.isFiat(debitCurrency)) { //Fiat transfer

      if (debitWalletName) { //Fiat withdrawal

        this.getWallet(debitWalletName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);

      }
      else if (creditWalletName) { //Fiat deposit

        this.getWallet(creditWalletName).getFiatAccount(debitCurrency).transfer(debitAmount).transfer(-debitFee);

      }
    }
    else if (CryptoTracker.isCrypto(debitCurrency)) {  //Crypto transfer

      let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

      this.getWallet(creditWalletName).getCryptoAccount(debitCurrency).deposit(lots);

    }
  }
  else if (action === 'Trade') { //Trade

    if (CryptoTracker.isFiat(debitCurrency) && CryptoTracker.isCrypto(creditCurrency)) {  //Buy crypto

      this.getWallet(debitWalletName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);

      let lot = new Lot(date, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee, debitWalletName);

      this.getWallet(debitWalletName).getCryptoAccount(creditCurrency).deposit(lot);

    }
    else if (CryptoTracker.isCrypto(debitCurrency) && CryptoTracker.isFiat(creditCurrency)) { //Sell crypto

      let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

      this.closeLots(lots, date, creditCurrency, creditExRate, creditAmount, creditFee, debitWalletName);

      this.getWallet(debitWalletName).getFiatAccount(creditCurrency).transfer(creditAmount).transfer(-creditFee);

    }
    else if (CryptoTracker.isCrypto(debitCurrency) && CryptoTracker.isCrypto(creditCurrency)) { //Exchange cyrptos

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
  else if (action === 'Payment') { //Payment

    let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

    //convert amount and fee to accounting currency
    let creditAmount = Math.round(debitExRate * debitAmount * 100) / 100;
    let creditFee = Math.round(debitExRate * debitFee * 100) / 100;

    this.closeLots(lots, date, this.accountingCurrency, 0, creditAmount, creditFee, debitWalletName);

  }
};
