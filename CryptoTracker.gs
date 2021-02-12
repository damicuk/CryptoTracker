class CryptoTracker {

  constructor() {

    this.settings = new Settings();
    this.validateSettings();
    this._wallets = new Map();
    this.closedLots = new Array();

  }

  get fiatConvert() {
    return this.settings['Fiat Convert'];
  }

  get fiats() {
    return Array.from(this.settings['Fiats']);
  }

  get cryptos() {
    return Array.from(this.settings['Cryptos']);
  }

  get wallets() {
    return Array.from(this._wallets.values());
  }

  getWallet(name) {

    if (!this._wallets.has(name)) {

      this._wallets.set(name, new Wallet(name));

    }
    return this._wallets.get(name);
  }

  isFiat(currency) {
    return this.settings['Fiats'].has(currency);
  }

  isCrypto(currency) {
    return this.settings['Cryptos'].has(currency);
  }

  getFiatCents(fiat) {

    let cents = 0;
    for (let wallet of this.wallets) {

      cents += wallet.getFiatCents(fiat);

    }
    return cents;
  }

  getCryptoSatoshi(crypto) {

    let satoshi = 0;
    for (let wallet of this.wallets) {

      satoshi += wallet.getCryptoSatoshi(crypto);

    }
    return satoshi;
  }

  getCostBasisCents(crypto) {

    let costBasisCents = 0;
    for (let wallet of this.wallets) {

      costBasisCents += wallet.getCostBasisCents(crypto);

    }
    return costBasisCents;
  }

  getFiatBalance(fiat) {

    return this.getFiatCents(fiat) / 100;
  }

  getCryptoBalance(crypto) {

    return this.getCryptoSatoshi(crypto) / 1e8;
  }

  getCostBasis(crypto) {

    return this.getCostBasisCents(crypto) / 100;
  }

  closeLots(lots, date, creditWalletName, creditCurrency, creditExRate, creditAmount, creditFee) {

    let creditAmountSatoshi = Math.round(creditAmount * 1e8);
    let creditFeeSatoshi = Math.round(creditFee * 1e8);

    //get total satoshi in lots
    let lotsSatoshi = 0;
    for (let lot of lots) {

      lotsSatoshi += lot.satoshi;

    }

    //apportion creditAmount creditFee to lots
    let remainingAmountSatoshi = creditAmountSatoshi;
    let remainingFeeSatoshi = creditFeeSatoshi;

    // loop through all except the last lot
    for (let i = 0; i < lots.length - 1; i++) {

      let lot = lots[i];
      let apportionedAmountSatoshi = Math.round((lot.satoshi / lotsSatoshi) * creditAmountSatoshi);
      let apportionedFeeSatoshi = Math.round((lot.satoshi / lotsSatoshi) * creditFeeSatoshi);

      let closedLot = new ClosedLot(lot, date, creditWalletName, creditCurrency, creditExRate, (apportionedAmountSatoshi / 1e8), (apportionedFeeSatoshi / 1e8));
      this.closedLots.push(closedLot);

      remainingAmountSatoshi -= apportionedAmountSatoshi;
      remainingFeeSatoshi -= apportionedFeeSatoshi;

    }
    //just add the remaining amount fee to the last closed lot to correct for any accumulated rounding errors
    let closedLot = new ClosedLot(lots[lots.length - 1], date, creditWalletName, creditCurrency, creditExRate, (remainingAmountSatoshi / 1e8), (remainingFeeSatoshi / 1e8));
    this.closedLots.push(closedLot);

  }

  processTrades() {

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

      // Logger.log(`Date: ${date.toISOString()}, Action; ${action}, 
      //           Debit: ${debitWalletName} ${debitCurrency} Exrate ${debitExRate} Amount ${debitAmount} Fee ${debitFee}, 
      //           Credit: ${creditWalletName} ${creditCurrency} Exrate ${creditExRate} Amount ${creditAmount} Fee ${creditFee}`);

      if (action == 'Transfer') {  //Transfer

        if (this.isFiat(debitCurrency)) { //Fiat transfer

          if (debitWalletName) { //Fiat withdrawal

            this.getWallet(debitWalletName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);
            // Logger.log(`Fiat withdrawal balance: ${this.getWallet(debitWalletName).getFiatAccount(debitCurrency).balance}`);

          }
          else if (creditWalletName) { //Fiat deposit

            //debit currency amount fee used as credit values are empty to avoid data redundancy
            this.getWallet(creditWalletName).getFiatAccount(debitCurrency).transfer(debitAmount).transfer(-debitFee);
            // Logger.log(`Fiat deposit balance: ${this.getWallet(creditWalletName).getFiatAccount(debitCurrency).balance}`);

          }
        }
        else if (this.isCrypto(debitCurrency)) {  //Crypto transfer

          // Logger.log(`Crypto transfer: ${debitWalletName} ${debitCurrency} ${this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).balance} - ${debitAmount} - ${debitFee} ${creditWalletName}`);

          let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee);
          // Logger.log(`Crypto transfer balance: ${debitWalletName} ${debitCurrency} ${this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).balance}`);

          //debit currency used as credit currency is empty to avoid data redundancy
          this.getWallet(creditWalletName).getCryptoAccount(debitCurrency).deposit(lots);
          // Logger.log(`Crypto transfer balance: ${creditWalletName} ${debitCurrency} ${this.getWallet(creditWalletName).getCryptoAccount(debitCurrency).balance}`);

        }
      }
      else if (action == 'Trade') { //Trade

        if (this.isFiat(debitCurrency) && this.isCrypto(creditCurrency)) {  //Buy crypto

          // Logger.log(`Trade buy crypto debit: ${debitCurrency} ${debitAmount} fee ${debitFee} credit: ${creditCurrency} ${creditAmount} fee ${creditFee}`);

          this.getWallet(debitWalletName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);
          // Logger.log(`Trade fiat debit balance: ${this.getWallet(debitWalletName).getFiatAccount(debitCurrency).balance}`);

          // Logger.log(`Trade buy crypto debit: ${debitCurrency} (exrate: ${debitExRate}) ${debitAmount} fee ${debitFee}, credit: ${creditCurrency} ${creditAmount} fee ${creditFee}`);

          let lot = new Lot(date, debitWalletName, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee);

          // Logger.log(`[${lot.date.toISOString()}] Lot ${lot.creditCurrency} ${lot.creditAmountSatoshi / 1e8} - ${lot.creditFeeSatoshi / 1e8} = ${lot.satoshi / 1e8}
          //     ${lot.debitCurrency} (${lot.debitAmountSatoshi / 1e8} - ${lot.debitFeeSatoshi / 1e8}) x rate ${lot.debitExRate} = Cost Basis ${this.fiatConvert} ${lot.costBasisCents / 100}`);

          //debit wallet name used as credit wallet name is empty to avoid data redundancy
          this.getWallet(debitWalletName).getCryptoAccount(creditCurrency).deposit([lot]);
          // Logger.log(`Trade crypto credit balance: ${debitWalletName} ${creditCurrency} ${this.getWallet(debitWalletName).getCryptoAccount(creditCurrency).balance}`);

        }
        else if (this.isCrypto(debitCurrency) && this.isFiat(creditCurrency)) { //Sell crypto

          // Logger.log(`Trade sell crypto, debit: ${debitCurrency} ${debitAmount} fee ${debitFee}, credit: ${creditCurrency} ${creditAmount} fee ${creditFee}`);

          let lots = this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(debitAmount, debitFee);
          // Logger.log(`Trade crypto balance: ${debitWalletName} ${debitCurrency} ${this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).balance}`);

          //debit wallet name used as credit wallet name is empty to avoid data redundancy
          this.getWallet(debitWalletName).getFiatAccount(creditCurrency).transfer(creditAmount).transfer(-creditFee);
          // Logger.log(`Trade fiat creditbalance: ${this.getWallet(debitWalletName).getFiatAccount(creditCurrency).balance}`);

          //debit wallet name used as credit wallet name is empty to avoid data redundancy
          this.closeLots(lots, date, debitWalletName, creditCurrency, creditExRate, creditAmount, creditFee);

        }
        else if (this.isCrypto(debitCurrency) && this.isCrypto(creditCurrency)) { //Exchange cyrptos


        }
      }
      else if (action == 'Reward') { //Reward

        //the cost base is the value of (credit exchange rate x credit amount)
        let lot = new Lot(date, creditWalletName, creditCurrency, creditExRate, creditAmount, 0, creditCurrency, creditAmount, 0);

        // Logger.log(`[${lot.date.toISOString()}] Lot ${lot.creditCurrency} ${lot.creditAmountSatoshi / 1e8} - ${lot.creditFeeSatoshi / 1e8} = ${lot.satoshi / 1e8}
        //     ${lot.debitCurrency} (${lot.debitAmountSatoshi / 1e8} - ${lot.debitFeeSatoshi / 1e8}) x rate ${lot.debitExRate} = Cost Basis ${this.fiatConvert} ${lot.costBasisCents / 100}`);


        this.getWallet(creditWalletName).getCryptoAccount(creditCurrency).deposit([lot]);
        // Logger.log(`Reward crypto credit balance: ${creditWalletName} ${creditCurrency} ${this.getWallet(creditWalletName).getCryptoAccount(creditCurrency).balance}`);
      }
      else if (action == 'Fee') { //Fee

        this.getWallet(debitWalletName).getCryptoAccount(debitCurrency).withdraw(0, debitFee);

      }
    }
  }

  validateSettings() {

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
  }

  validateLedger(checkExRates = true) {

    let ledgerRecords = this.getLedgerRecords();
    this.validateLedgerRecords(ledgerRecords, checkExRates);

  }

  validateLedgerRecords(ledgerRecords, checkExRates = true) {

    for (let ledgerRecord of ledgerRecords) {
      this.validateLedgerRecord(ledgerRecord, checkExRates);
    }
  }

  validateLedgerRecord(ledgerRecord, checkExRates = true) {

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
        else if (this.isCrypto(debitCurrency) && creditCurrency != this.fiatConvert) { //sell or exchange crypto
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

  updateExRates() {

    let ledgerRecords = this.getLedgerRecords();
    this.validateLedgerRecords(ledgerRecords, false);

    //array of values used to update the sheet
    let debitExRateValues = [];
    let creditExRateValues = [];

    // fill in any missing exchange rates with GOOGLEFINANCE formula
    const formula = `=Index(GoogleFinance(CONCAT("CURRENCY:", CONCAT("#currency#", "#fiatConvert#")), "close", A#row#), 2,2)`;

    //do we need to update these columns?
    let updateDebitExRates = false;
    let updateCreditExRates = false;

    for (let i = 0; i < ledgerRecords.length; i++) {

      let ledgerRecord = ledgerRecords[i];
      let action = ledgerRecord.action;
      let debitCurrency = ledgerRecord.debitCurrency;
      let debitExRate = ledgerRecord.debitExRate;
      let creditCurrency = ledgerRecord.creditCurrency;
      let creditExRate = ledgerRecord.creditExRate;
      let hasDebitExRate = ledgerRecord.hasDebitExRate;
      let hasCreditExRate = ledgerRecord.hasCreditExRate;

      //the value used to update the sheet
      let debitExRateValue = '';
      if (hasDebitExRate) {
        debitExRateValue = debitExRate;
      }

      //the value used to update the sheet
      let creditExRateValue = '';
      if (hasCreditExRate) {
        creditExRateValue = creditExRate;
      }

      if (action == 'Trade') {

        if (this.isCrypto(creditCurrency) && debitCurrency != this.fiatConvert) { //buy or exchange crypto
          if (!hasDebitExRate || debitExRate <= 0) {
            debitExRateValue = formula.replace(/#currency#/, debitCurrency).replace(/#fiatConvert#/, this.fiatConvert).replace(/#row#/, (i + 3).toString());
            updateDebitExRates = true;
          }
        }
        else if (this.isCrypto(debitCurrency) && creditCurrency != this.fiatConvert) { //sell or exchange crypto
          if (!hasCreditExRate || creditExRate <= 0) {
            creditExRateValue = formula.replace(/#currency#/, creditCurrency).replace(/#fiatConvert#/, this.fiatConvert).replace(/#row#/, (i + 3).toString());
            updateCreditExRates = true;
          }
        }
      }
      else if (action == 'Reward') {
        if (!hasCreditExRate || creditExRate <= 0) {
          creditExRateValue = formula.replace(/#currency#/, creditCurrency).replace(/#fiatConvert#/, this.fiatConvert).replace(/#row#/, (i + 3).toString());
          updateCreditExRates = true;
        }
      }

      debitExRateValues.push([debitExRateValue]);
      creditExRateValues.push([creditExRateValue]);
    }

    if (updateDebitExRates) {
      this.setExRates(3, debitExRateValues);
    }

    if (updateCreditExRates) {
      this.setExRates(8, creditExRateValues);
    }
  }

  setExRates(colIndex, exRateValues) {

    let ledgerRange = this.getLedgerRange();
    let exRatesRange = ledgerRange.offset(0, colIndex, exRateValues.length, 1);

    exRatesRange.setValues(exRateValues);

    //apply changes
    SpreadsheetApp.flush();

    //read in values calculated by the formula
    //remove failed formula results
    //overwrite the formulas with hard coded values
    let calculatedExRateValues = exRatesRange.getValues();
    let validExRateValues = this.removeInvalidExRates(calculatedExRateValues);
    exRatesRange.setValues(validExRateValues);

    //applies changes
    SpreadsheetApp.flush();
  }

  getLedgerRecords() {

    let ledgerRange = this.getLedgerRange();
    let ledgerData = ledgerRange.getValues();

    //convert raw data to object array
    let ledgerRecords = [];
    for (let row of ledgerData) {

      let ledgerRecord = new LedgerRecord(row[0],
        row[1],
        row[2],
        row[3],
        row[4],
        row[5],
        row[6],
        row[7],
        row[8],
        row[9],
        row[10],
        row[11],
        row[3] !== '',
        row[4] !== '',
        row[5] !== '',
        row[8] !== '',
        row[9] !== '',
        row[10] !== '');

      //Stop reading here
      if (ledgerRecord.action == 'Stop') {

        break;

      }

      ledgerRecords.push(ledgerRecord);

    }
    return ledgerRecords;
  }

  getLedgerRange() {

    let ss = SpreadsheetApp.getActive();
    let ledgerSheet = ss.getSheetByName('Ledger');

    let ledgerRange = ledgerSheet.getDataRange();
    ledgerRange = ledgerRange.offset(2, 0, ledgerRange.getHeight() - 2, 12);

    return ledgerRange;
  }

  removeInvalidExRates(exRateValues) {

    let validExRateValues = [];

    for (let exRateValue of exRateValues) {
      if (isNaN(exRateValue[0])) {
        validExRateValues.push(['']);
      }
      else {
        validExRateValues.push(exRateValue);
      }
    }
    return validExRateValues;
  }

  getFiatTable() {

    //fiat currency column headers
    let table = [['Wallet'].concat(this.fiats)];

    //wallet name row headers and balances
    for (let wallet of this.wallets) {
      if (wallet.hasFiatAccounts) {
        table.push([wallet.name]);
        for (let fiat of this.fiats) {
          let balance = wallet.getFiatBalance(fiat);
          table[table.length - 1].push(balance);
        }
      }
    }

    //total for each fiat
    table.push(['Total']);
    for (let fiat of this.fiats) {
      let balance = this.getFiatBalance(fiat);
      table[table.length - 1].push(balance);
    }

    return table;
  }

  getCryptoTable() {

    //fiat currency column headers
    let table = [['Wallet'].concat(this.cryptos)];

    //wallet name row headers and balances
    for (let wallet of this.wallets) {
      if (wallet.hasCryptoAccounts) {
        table.push([wallet.name]);
        for (let crypto of this.cryptos) {
          let balance = wallet.getCryptoBalance(crypto);
          table[table.length - 1].push(balance);
        }
      }
    }

    //total for each crypto
    table.push(['Total']);
    for (let crypto of this.cryptos) {
      let balance = this.getCryptoBalance(crypto);
      table[table.length - 1].push(balance);
    }

    return table;
  }

  getProfitTable() {

    let table = [['Crypto', 'Quantity', 'Cost Price', 'Cost Basis', 'Current Price', 'Value', 'Unrealized P/L', 'Unrealized P/L %']];

    let totalCostBasisCents = 0;
    for (let crypto of this.cryptos) {

      let balance = this.getCryptoBalance(crypto);

      if (balance) {

        let costBasisCents = this.getCostBasisCents(crypto);
        let costBasis = costBasisCents / 100;
        let costPrice = Math.round(costBasisCents / balance) / 100;

        totalCostBasisCents += costBasisCents;

        table.push([crypto]);
        let lastIndex = table.length - 1;
        table[lastIndex].push(balance);
        table[lastIndex].push(costPrice);
        table[lastIndex].push(costBasis);
        table[lastIndex].push('');
        table[lastIndex].push('');
        table[lastIndex].push('');
        table[lastIndex].push('');

      }
    }

    let totalCostBasis = totalCostBasisCents / 100;

    table.push(['Total']);
    let lastIndex = table.length - 1;
    table[lastIndex].push('');
    table[lastIndex].push('');
    table[lastIndex].push(totalCostBasis);
    table[lastIndex].push('');
    table[lastIndex].push('');
    table[lastIndex].push('');
    table[lastIndex].push('');

    return table;
  }

  getClosedSummaryTable() {

    let table = [['Crypto', 'Quantity', 'Av. Cost Price', 'Cost Basis', 'Av. Sell Price', 'Proceeds', 'Realized P/L', 'Realized P/L %']];


    let totalCostBasisCents = 0;
    let totalProceedsCent = 0;
    for (let crypto of this.cryptos) {

      let satoshi = 0;
      let costBasisCents = 0;
      let proceedsCents = 0;

      for (let closedLot of this.closedLots) {

        if (closedLot.crypto == crypto) {

          satoshi += closedLot.satoshi;
          costBasisCents += closedLot.costBasisCents;
          proceedsCents += closedLot.proceedsCents;


        }
      }

      let amount = satoshi / 1e8;

      if (amount) {

        let costBasis = costBasisCents / 100;
        let proceeds = proceedsCents / 100;
        let costPrice = Math.round(costBasisCents / amount) / 100;
        let sellPrice = Math.round(proceedsCents / amount) / 100;
        let profit = (proceedsCents - costBasisCents) / 100;
        let percentProfit = Math.round((proceedsCents - costBasisCents) * 100 / costBasisCents) / 100;

        totalCostBasisCents += costBasisCents;
        totalProceedsCent += proceedsCents;

        table.push([crypto]);
        let lastIndex = table.length - 1;
        table[lastIndex].push(amount);
        table[lastIndex].push(costPrice);
        table[lastIndex].push(costBasis);
        table[lastIndex].push(sellPrice);
        table[lastIndex].push(proceeds);
        table[lastIndex].push(profit);
        table[lastIndex].push(percentProfit);

      }
    }

    let totalCostBasis = totalCostBasisCents / 100;
    let totalProceeds = totalProceedsCent / 100;
    let totalProfit = (totalProceedsCent - totalCostBasisCents) / 100;
    let totalPercentProfit = Math.round((totalProceedsCent - totalCostBasisCents) * 100 / totalCostBasisCents) / 100;

    table.push(['Total']);
    let lastIndex = table.length - 1;
    table[lastIndex].push('');
    table[lastIndex].push('');
    table[lastIndex].push(totalCostBasis);
    table[lastIndex].push('');
    table[lastIndex].push(totalProceeds);
    table[lastIndex].push(totalProfit);
    table[lastIndex].push(totalPercentProfit);

    return table;
  }

  getClosedDetailsTable() {

    let table = [['Date Sell',
                  'Crypto',
                  'Amount',
                  'Proceeds',
                  'Cost Basis',
                  'Realized P/L',
                  'Realized P/L %',
                  'Date Buy',
                  'Exchange Buy',
                  'Credit Amount Buy',
                  'Credit Fee Buy',
                  'Debit Currency Buy',
                  'Debit Amount Buy',
                  'Debit Fee Buy',
                  'Exchange Rate Buy',
                  'Exchange Sell',
                  'Credit Currency Sell',
                  'Credit Amount Sell',
                  'Fee Sell',
                  'Exchange Rate Sell']];

    for (let closedLot of this.closedLots) {

      let lot = closedLot.lot;
      
      let dateSell = closedLot.date;
      let crypto = closedLot.crypto;
      let amount = closedLot.satoshi / 1e8;
      let proceedsCents = closedLot.proceedsCents
      let proceeds = proceedsCents / 100;
      let costBasisCents = closedLot.costBasisCents;
      let costBasis = costBasisCents / 100;

      let profit = (proceedsCents - costBasisCents) / 100;
      let percentProfit = Math.round((proceedsCents - costBasisCents) * 100 / costBasisCents) / 100; 

      let dateBuy = lot.date;
      let exchangeBuy = lot.walletName;
      let creditAmountBuy = lot.creditAmountSatoshi / 1e8;
      let creditFeeBuy = lot.creditFeeSatoshi / 1e8;

      let debitCurrencyBuy = lot.debitCurrency;
      let debitAmountBuy = lot.debitAmountSatoshi / 1e8;
      let debitFeeBuy = lot.debitFeeSatoshi / 1e8;
      let debitExRateBuy = lot.debitExRate;

      let exchangeSell = closedLot.walletName;
      let creditCurrencySell = closedLot.creditCurrency;
      let creditAmountSell = closedLot.creditAmountSatoshi / 1e8;
      let creditFeeSell = closedLot.creditFeeSatoshi / 1e8;
      let creditExRateSell = closedLot.creditExRate;

      table.push([dateSell,
                  crypto,
                  amount,
                  proceeds,
                  costBasis,
                  profit,
                  percentProfit,
                  dateBuy,
                  exchangeBuy,
                  creditAmountBuy,
                  creditFeeBuy,
                  debitCurrencyBuy,
                  debitAmountBuy,
                  debitFeeBuy,
                  debitExRateBuy,
                  exchangeSell,
                  creditCurrencySell,
                  creditAmountSell,
                  creditFeeSell,
                  creditExRateSell]);
    }

    return table;

  }
}

function processTrades() {

  let cryptoTracker = new CryptoTracker();

  cryptoTracker.processTrades();
  // let fiatConvert = cryptoTracker.fiatConvert;

  // for (let closedLot of cryptoTracker.closedLots) {

  //   let lot = closedLot.lot;

  //   Logger.log(`[${lot.date.toISOString()}] Lot ${lot.debitWalletName} ${lot.creditCurrency} ${lot.creditAmountSatoshi / 1e8} - ${lot.creditFeeSatoshi / 1e8} = ${lot.satoshi / 1e8}
  //           ${lot.debitCurrency} (${lot.debitAmountSatoshi / 1e8} - ${lot.debitFeeSatoshi / 1e8}) x rate ${lot.debitExRate} = Cost Basis ${fiatConvert} ${lot.costBasisCents / 100}
  //           [${closedLot.date.toISOString()}] Closed ${closedLot.creditWalletName}
  //           ${closedLot.creditCurrency} (${closedLot.creditAmountSatoshi / 1e8} - ${closedLot.creditFeeSatoshi / 1e8}) x rate ${closedLot.creditExRate} = Proceeds ${fiatConvert} ${closedLot.proceedsCents / 100} 
  //           `);
  // }

  let fiatTable = cryptoTracker.getFiatTable();
  Logger.log(fiatTable);

  let cryptoTable = cryptoTracker.getCryptoTable();
  Logger.log(cryptoTable);

  let profitTable = cryptoTracker.getProfitTable();
  Logger.log(profitTable);

  let closedSummaryTable = cryptoTracker.getClosedSummaryTable();
  Logger.log(closedSummaryTable);

  let closedDetailsTable = cryptoTracker.getClosedDetailsTable();
  //Logger.log(closedDetailsTable);

  let accountsSheet = getSheet('Accounts');

  const rowOffset = 3
  const colOffset = 2;

  let fiatRange = accountsSheet.getRange(rowOffset, colOffset, fiatTable.length, fiatTable[0].length);
  fiatRange.setValues(fiatTable);
  formatTable(fiatRange);

  let cryptoRange = accountsSheet.getRange(fiatRange.getLastRow() + rowOffset, colOffset, cryptoTable.length, cryptoTable[0].length);
  cryptoRange.setValues(cryptoTable);
  formatTable(cryptoRange);

  let profitRange = accountsSheet.getRange(cryptoRange.getLastRow() + rowOffset, colOffset, profitTable.length, profitTable[0].length);
  profitRange.setValues(profitTable);
  formatTable(profitRange);

  let closedSummaryRange = accountsSheet.getRange(profitRange.getLastRow() + rowOffset, colOffset, closedSummaryTable.length, closedSummaryTable[0].length);
  closedSummaryRange.setValues(closedSummaryTable);
  formatTable(closedSummaryRange);

  accountsSheet.autoResizeColumns(1, accountsSheet.getDataRange().getNumColumns());

  let closedDetailsSheet = getSheet('Closed');

  let closedDetailsRange = closedDetailsSheet.getRange(1, 1, closedDetailsTable.length, closedDetailsTable[0].length);
  closedDetailsRange.setValues(closedDetailsTable);
  formatTable(closedDetailsRange);


  closedDetailsSheet.autoResizeColumns(1, closedDetailsSheet.getDataRange().getNumColumns());

}

function getSheet(name) {

  ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {

    ss.insertSheet(name);
  }
  else {

    sheet.clear();

  }

  return sheet;
}

function formatTable(dataRange) {

  dataRange.setBorder(
    true, true, true, true, null, null,
    null,
    SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  let headerRange = dataRange.offset(0, 0, 1, dataRange.getNumColumns());

  headerRange
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackgroundColor('#007272')
    .setBorder(
      true, true, true, true, null, null,
      null,
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM);



  let columnHeaderRange = dataRange.offset(0, 0, dataRange.getNumRows(), 1);

  columnHeaderRange
    .setFontWeight('bold')
    .setFontStyle('italic')
    .setBorder(
      true, true, true, true, null, null,
      null,
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  let totalRange = dataRange.offset(dataRange.getNumRows() - 1, 0, 1, dataRange.getNumColumns());

  totalRange
    .setFontWeight('bold')
    //.setFontStyle('italic')
    .setBackgroundColor('#76a5af')
    .setBorder(
      true, true, true, true, null, null,
      null,
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

}

function validateLedger() {

  new CryptoTracker().validateLedger();

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);

}

function updateExRates() {

  new CryptoTracker().updateExRates();

}
