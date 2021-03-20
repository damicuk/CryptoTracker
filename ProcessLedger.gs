CryptoTracker.prototype.processLedger = function () {

  let ledgerRecords = this.getLedgerRecords();

  let ledgerValid = this.validateLedgerRecords(ledgerRecords);

  if (!ledgerValid) {

    return false;

  }

  for (let ledgerRecord of ledgerRecords) {

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

      if (this.isFiat(debitCurrency)) { //Fiat transfer

        if (debitWalletName) { //Fiat withdrawal

          this.getWallet(debitWalletName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);

        }
        else if (creditWalletName) { //Fiat deposit

          this.getWallet(creditWalletName).getFiatAccount(debitCurrency).transfer(debitAmount).transfer(-debitFee);

        }
      }
      else if (this.isCrypto(debitCurrency)) {  //Crypto transfer

        let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching);

        this.getWallet(creditWalletName).getCryptoAccount(debitCurrency).deposit(lots);

      }
    }
    else if (action === 'Trade') { //Trade

      if (this.isFiat(debitCurrency) && this.isCrypto(creditCurrency)) {  //Buy crypto

        this.getWallet(debitWalletName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);

        let lot = new Lot(date, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee, debitWalletName);

        this.getWallet(debitWalletName).getCryptoAccount(creditCurrency).deposit(lot);

      }
      else if (this.isCrypto(debitCurrency) && this.isFiat(creditCurrency)) { //Sell crypto

        let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching);

        this.closeLots(lots, date, creditCurrency, creditExRate, creditAmount, creditFee, debitWalletName);

        this.getWallet(debitWalletName).getFiatAccount(creditCurrency).transfer(creditAmount).transfer(-creditFee);

      }
      else if (this.isCrypto(debitCurrency) && this.isCrypto(creditCurrency)) { //Exchange cyrptos

        let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching);

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

      let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching);

      this.donateLots(lots, date, debitExRate, debitWalletName);

    }
    else if (action === 'Gift') { //Gift

      this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching);

    }
    else if (action === 'Payment') { //Payment

      let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching);

      this.payLots(lots, date, debitExRate, debitAmount, debitFee, debitWalletName);

    }
  }
  return true;
}
