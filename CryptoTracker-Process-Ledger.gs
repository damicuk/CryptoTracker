CryptoTracker.prototype.processLedgerRecords = function () {

  let ledgerRecords = this.getLedgerRecords();

  this.validateLedgerRecords(ledgerRecords);

  //sort by date
  ledgerRecords.sort(function (a, b) {
    return a.date - b.date;
  });

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

    if (action == 'Transfer') {  //Transfer

      if (this.isFiat(debitCurrency)) { //Fiat transfer

        if (debitWalletName) { //Fiat withdrawal

          this.getWallet(debitWalletName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);

        }
        else if (creditWalletName) { //Fiat deposit

          //debit currency amount fee used as credit values are empty to avoid data redundancy
          this.getWallet(creditWalletName).getFiatAccount(debitCurrency).transfer(debitAmount).transfer(-debitFee);

        }
      }
      else if (this.isCrypto(debitCurrency)) {  //Crypto transfer

        let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching);

        //debit currency used as credit currency is empty to avoid data redundancy
        this.getWallet(creditWalletName).getCryptoAccount(debitCurrency).deposit(lots);

      }
    }
    else if (action == 'Trade') { //Trade

      if (this.isFiat(debitCurrency) && this.isCrypto(creditCurrency)) {  //Buy crypto

        this.getWallet(debitWalletName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);

        let lot = new Lot(date, debitWalletName, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee);

        //debit wallet name used as credit wallet name is empty to avoid data redundancy
        this.getWallet(debitWalletName).getCryptoAccount(creditCurrency).deposit([lot]);

      }
      else if (this.isCrypto(debitCurrency) && this.isFiat(creditCurrency)) { //Sell crypto

        let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching);

        //debit wallet name used as credit wallet name is empty to avoid data redundancy
        this.closeLots(lots, date, debitWalletName, creditCurrency, creditExRate, creditAmount, creditFee);

        //debit wallet name used as credit wallet name is empty to avoid data redundancy
        this.getWallet(debitWalletName).getFiatAccount(creditCurrency).transfer(creditAmount).transfer(-creditFee);

      }
      else if (this.isCrypto(debitCurrency) && this.isCrypto(creditCurrency)) { //Exchange cyrptos

        let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching);

        //debit wallet name used as credit wallet name is empty to avoid data redundancy
        this.closeLots(lots, date, debitWalletName, creditCurrency, creditExRate, creditAmount, creditFee);

        let lot = new Lot(date, debitWalletName, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee);

        //debit wallet name used as credit wallet name is empty to avoid data redundancy
        this.getWallet(debitWalletName).getCryptoAccount(creditCurrency).deposit([lot]);

      }
    }
    else if (action == 'Reward') { //Reward

      //the cost base is the value of (credit exchange rate x credit amount)
      let lot = new Lot(date, creditWalletName, creditCurrency, creditExRate, creditAmount, 0, creditCurrency, creditAmount, 0);

      this.getWallet(creditWalletName).getCryptoAccount(creditCurrency).deposit([lot]);

    }
    else if (action == 'Gift' || action == 'Fee') { //Gift or Fee

      this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee, this.lotMatching);

    }
  }
}

