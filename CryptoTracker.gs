class CryptoTracker {

  constructor() {

    this.settings = new Settings();
    this.validateSettings();
    this.wallets = new Map();
    this.closedLots = new Array();

  }

  getWallet(name) {

    if (!this.wallets.has(name)) {

      this.wallets.set(name, new Wallet(name));

    }
    return this.wallets.get(name);
  }

  isFiat(currency) {
    return this.settings['Fiats'].has(currency);
  }

  isCrypto(currency) {
    return this.settings['Cryptos'].has(currency);
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

    if (isNaN(date)) {
      throw Error('Ledger record: missing date.');
    }
    else if (isNaN(debitExRate)) {
      throw Error('[${date.toISOString()}] [${action}] Ledger record debit exchange rate is not valid (number or blank).');
    }
    else if (isNaN(debitAmount)) {
      throw Error('[${date.toISOString()}] [${action}] Ledger record debit amount is not valid (number or blank).');
    }
    else if (isNaN(debitFee)) {
      throw Error('[${date.toISOString()}] [${action}] Ledger record debit fee is not valid (number or blank).');
    }
    else if (isNaN(creditExRate)) {
      throw Error('[${date.toISOString()}] [${action}] Ledger record credit exchange rate is not valid (number or blank).');
    }
    else if (isNaN(creditAmount)) {
      throw Error('[${date.toISOString()}] [${action}] Ledger record credit amount is not valid (number or blank).');
    }
    else if (isNaN(creditFee)) {
      throw Error('[${date.toISOString()}] [${action}] Ledger record credit fee is not valid (number or blank).');
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
      else if (debitAmount <= 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record debit amount (${debitAmount.toLocaleString()}) must be greater than 0.`);
      }
      else if (creditAmount != 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record leave transfer credit amount (${creditAmount.toLocaleString()}) blank. It is inferred from the debit amount (${debitAmount.toLocaleString()}) and debit fee (${debitFee.toLocaleString()}).`);
      }
      else if (debitFee < 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record transfer debit fee (${debitFee.toLocaleString()}) must be greater or equal to 0.`);
      }
      else if (creditFee != 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit fee (${creditFee.toLocaleString()}) blank.`);
      }
      else if (!debitWalletName && !creditWalletName) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record has no debit or credit wallet specified.`);
      }
      else if (debitExRate) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit exchange rate (${debitExRate}) blank.`);
      }
      else if (creditExRate) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit exchange rate (${creditExRate}) blank.`);
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
        throw Error(`[${date.toISOString()}] [${action}] Ledger record credit wallet (${creditWalletName}) is redundant, leave blank. It is inferred from the debit wallet (${debitWalletName}).`);
      }
      else if (debitAmount < 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record debit amount (${debitAmount.toLocaleString()}) must be greater or equal to 0.`);
      }
      else if (debitFee < 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record debit fee (${debitFee.toLocaleString()}) must be greater or equal to 0.`);
      }
      else if (creditAmount < 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record credit amount (${creditAmount.toLocaleString()}) must be greater or equal to 0.`);
      }
      else if (creditFee < 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record credit fee (${creditFee.toLocaleString()}) must be greater or equal to 0.`);
      }
      if (this.debitCurrency == this.fiatConvert && debitExRate) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record debit currency (${debitCurrency}) is fiat convert (${this.fiatConvert}). Leave exchange rate blank.`);
      }
      if (this.creditCurrency == this.fiatConvert && creditExRate) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record credit currency (${creditCurrency}) is fiat convert (${this.fiatConvert}). Leave exchange rate blank.`);
      }
      else if (checkExRates) {
        if (!this.isFiat(creditCurrency) && this.debitCurrency != this.fiatConvert && (!debitExRate || debitExRate <= 0)) {
          throw Error(`[${date.toISOString()}] [${action}] Ledger record debit currency (${debitCurrency}) needs a valid fiat convert (${this.fiatConvert}) exchange rate.`);
        }
        else if (!this.isFiat(debitCurrency) && this.creditCurrency != this.fiatConvert && (!creditExRate || creditExRate <= 0)) {
          throw Error(`[${date.toISOString()}] [${action}] Ledger record credit currency (${creditCurrency}) needs a valid fiat convert (${this.fiatConvert}) exchange rate.`);
        }
      }
    }
    else if (action == 'Reward') { //Reward
      if (debitCurrency) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit currency (${debitCurrency}) blank.`);
      }
      else if (debitExRate) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit exchange rate (${debitExRate}) blank.`);
      }
      else if (debitAmount != 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record leave debit amount (${debitAmount.toLocaleString()}) blank.`);
      }
      else if (debitFee != 0) {
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
      else if (!creditExRate) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record credit currency (${creditCurrency}) needs a valid fiat convert (${this.fiatConvert}) exchange rate.`);
      }
      else if (creditAmount <= 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record credit amount (${creditAmount.toLocaleString()}) must be greater than 0.`);
      }
      else if (creditFee != 0) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record leave credit fee (${creditFee.toLocaleString()}) blank.`);
      }
      else if (!creditWalletName) {
        throw Error(`[${date.toISOString()}] [${action}] Ledger record has no credit wallet specified.`);
      }
    }
    else {
      throw Error(`[${date.toISOString()}] Ledger record: action (${action}) is invalid.`);
    }
  }

  updateExRates() {

    this.validateLedger(false);

    let ledgerDataRange = this.getLedgerDataRange();
    let ledgerData = ledgerDataRange.getValues();

    let debitExRatesDataRange = ledgerDataRange.offset(0, 3, ledgerDataRange.getHeight(), 1);
    let creditExRatesDataRange = ledgerDataRange.offset(0, 8, ledgerDataRange.getHeight(), 1);

    //fill in any missing exchange rates with GOOGLEFINANCE formula
    const formula = `=Index(GoogleFinance(CONCAT("CURRENCY:", CONCAT("#currency#", "#fiatConvert#")), "close", A#row#), 2,2)`;

    let debitExRates = [];
    let creditExRates = [];

    //do we need to update these columns?
    let updateDebitExRates = false;
    let updateCreditExRates = false;

    for (let i = 0; i < ledgerData.length; i++) {

      let action = ledgerData[i][1];
      let debitCurrency = ledgerData[i][2];
      let debitExRate = ledgerData[i][3];
      let creditCurrency = ledgerData[i][7];
      let creditExRate = ledgerData[i][8];

      debitExRates.push([debitExRate]);
      creditExRates.push([creditExRate]);

      if (action == 'Trade') {

        if (!this.isFiat(creditCurrency) && debitCurrency != this.fiatConvert && (!debitExRate || isNaN(debitExRate) || Number(debitExRate) <= 0)) {

          debitExRates[i][0] = formula.replace(/#currency#/, debitCurrency).replace(/#fiatConvert#/, this.fiatConvert).replace(/#row#/, (i + 3).toString());
          updateDebitExRates = true;

        }
        else if (!this.isFiat(debitCurrency) && creditCurrency != this.fiatConvert && (!creditExRate || isNaN(creditExRate) || Number(creditExRate) <= 0)) {

          creditExRates[i][0] = formula.replace(/#currency#/, creditCurrency).replace(/#fiatConvert#/, this.fiatConvert).replace(/#row#/, (i + 3).toString());
          updateCreditExRates = true;

        }
      }
    }

    //only update the ex rates if necessary (slow)
    if (updateDebitExRates || updateCreditExRates) {

      //apply the formula to calculate the values
      if (updateDebitExRates) {
        debitExRatesDataRange.setValues(debitExRates);
      }

      if (updateCreditExRates) {
        creditExRatesDataRange.setValues(creditExRates);
      }

      //apply changes
      SpreadsheetApp.flush();

      //read in values calculated by the formula
      //remove failed formula results and invalid values
      //overwrite the formulas with hard coded values
      if (updateDebitExRates) {
        debitExRates = debitExRatesDataRange.getValues();
        debitExRates = this.removeInvalidExRates(debitExRates);
        debitExRatesDataRange.setValues(debitExRates);
      }

      if (updateCreditExRates) {
        creditExRates = creditExRatesDataRange.getValues();
        creditExRates = this.removeInvalidExRates(creditExRates);
        creditExRatesDataRange.setValues(creditExRates);
      }

      //applies changes
      SpreadsheetApp.flush();

    }
  }

  getLedgerRecords() {

    let ledgerDataRange = this.getLedgerDataRange();
    let ledgerData = ledgerDataRange.getValues();

    //sort by date
    ledgerData.sort(function (a, b) {
      return a[0] - b[0];
    });

    //convert raw data to object array
    let ledgerRecords = [];
    for (let row of ledgerData) {

      let ledgerRecord = new LedgerRecord(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11]);
      ledgerRecords.push(ledgerRecord);

    }
    return ledgerRecords;
  }

  getLedgerDataRange() {

    let ss = SpreadsheetApp.getActive();
    let ledgerSheet = ss.getSheetByName('Ledger');

    let ledgerDataRange = ledgerSheet.getDataRange();
    ledgerDataRange = ledgerDataRange.offset(2, 0, ledgerDataRange.getHeight() - 2, 12);

    return ledgerDataRange;
  }

  removeInvalidExRates(exRates) {

    let validExRates = [];

    for (let exRate of exRates) {
      if (isNaN(exRate[0])) {
        validExRates.push(['']);
      }
      else {
        validExRates.push(exRate);
      }
    }
    return validExRates;
  }
}

function processTrades() {

  let cryptoTracker = new CryptoTracker();

  cryptoTracker.processTrades();
  let fiatConvert = cryptoTracker.fiatConvert;

  for (let closedLot of cryptoTracker.closedLots) {

    let lot = closedLot.lot;

    // Logger.log(`[${lot.date.toISOString()}] Lot ${lot.debitWalletName} ${lot.creditCurrency} ${lot.creditAmountSatoshi / 1e8} - ${lot.creditFeeSatoshi / 1e8} = ${lot.satoshi / 1e8}
    //           ${lot.debitCurrency} (${lot.debitAmountSatoshi / 1e8} - ${lot.debitFeeSatoshi / 1e8}) x rate ${lot.debitExRate} = Cost Basis ${fiatConvert} ${lot.costBasisCents / 100}
    //           [${closedLot.date.toISOString()}] Closed ${closedLot.creditWalletName}
    //           ${closedLot.creditCurrency} (${closedLot.creditAmountSatoshi / 1e8} - ${closedLot.creditFeeSatoshi / 1e8}) x rate ${closedLot.creditExRate} = Proceeds ${fiatConvert} ${closedLot.proceedsCents / 100} 
    //           `);

  }

}

function validateLedger() {

  new CryptoTracker().validateLedger();

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);

}

function updateExRates() {

  new CryptoTracker().updateExRates();

}
