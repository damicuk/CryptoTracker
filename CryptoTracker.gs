class CryptoTracker {

  constructor() {

    this.settings = new Settings();
    this.wallets = new Map();
    this.fiatConvert = this.getFiatConvert();

  }

  getFiatConvert() {

    let fiatConvert = this.settings['Fiat Convert'];

    if (!fiatConvert) {
      throw Error(`Fiat Convert is missing from the settings sheet.`);
    }
    else if (!this.isFiat(fiatConvert)) {
      throw Error(`Fiat Convert (${fiatConvert}) is not listed as fiat (${this.fiats}) in the settings sheet.`);
    }
    else if (this.isCrypto(fiatConvert)) {
      throw Error(`Fiat Convert (${fiatConvert}) is listed as crypto (${this.cryptos}) in the settings sheet.`);
    }
    return fiatConvert;
  }

  getWallet(name) {

    if (!this.wallets.has(name)) {

      this.wallets.set(name, new Wallet(name));

    }
    return this.wallets.get(name);
  }

  isFiatConvert(currency) {
    return currency == this.fiatConvert;
  }

  isFiat(currency) {
    return this.settings['Fiats'].has(currency);
  }

  isCrypto(currency) {
    return this.settings['Cryptos'].has(currency);
  }

  get fiats() {
    return Array.from(this.settings['Fiats']);
  }

  get cryptos() {
    return Array.from(this.settings['Cryptos']);
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

      // if (action == 'Transfer') {  //Transfer

      //   if (debitCurrency) { //Withdrawal
      //     if (this.isFiat(debitCurrency)) { //Fiat withdrawal

      //       this.getExchange(exchangeName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);
      //       // Logger.log(`Fiat withdrawal balance: ${this.getExchange(exchangeName).getFiatAccount(debitCurrency).balance}`);

      //     }
      //     else if (this.isCrypto(debitCurrency)) { //Crypto withdrawal

      //     }
      //   }
      //   else {  //Deposit
      //     if (this.isFiat(creditCurrency)) { //Fiat deposit

      //       this.getExchange(exchangeName).getFiatAccount(creditCurrency).transfer(creditAmount).transfer(-creditFee);
      //       // Logger.log(`Fiat deposit balance: ${this.getExchange(exchangeName).getFiatAccount(creditCurrency).balance}`);

      //     }
      //     else if (this.isCrypto(creditCurrency)) { //Crypto deposit


      //     }
      //   }
      // }
      // else if (action == 'Trade') { //Trade

      //   if (this.isFiat(debitCurrency) && this.isCrypto(creditCurrency)) {  //Buy crypto

      //     // Logger.log(`Trade buy crypto, debit: ${debitCurrency} ${debitAmount} fee ${debitFee}, credit: ${creditCurrency} ${creditAmount} fee ${creditFee}`);
      //     this.getExchange(exchangeName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);
      //     // Logger.log(`Trade fiat debit balance: ${this.getExchange(exchangeName).getFiatAccount(debitCurrency).balance}`);

      //     // Logger.log(`Trade buy crypto debit: ${debitCurrency} (exrate: ${debitExRate}) ${debitAmount} fee ${debitFee}, credit: ${creditCurrency} ${creditAmount} fee ${creditFee}`);
      //     let lot = new Lot(date, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee);

      //     // Logger.log(`[${lot.date.toISOString()}] Lot 
      //     // ${lot.creditCurrency} ${lot.creditAmountSatoshi / 10e8} - ${lot.creditFeeSatoshi / 10e8} = ${lot.satoshi / 10e8}
      //     // ${lot.debitCurrency} (${lot.debitAmountSatoshi /10e8} - ${lot.debitFeeSatoshi /10e8}) x rate ${lot.debitExRate} = Cost Basis ${this.fiatConvert} ${lot.costBasisCents / 100}`);

      //     this.getExchange(exchangeName).getCryptoAccount(creditCurrency).deposit(lot);
      //     // Logger.log(`Trade crypto credit balance: ${this.getExchange(exchangeName).getCryptoAccount(creditCurrency).balance}`);

      //   }
      //   else if (this.isCrypto(debitCurrency) && this.isFiat(creditCurrency)) { //Sell crypto

      //     // Logger.log(`Trade sell crypto, debit: ${debitCurrency} ${debitAmount} fee ${debitFee}, credit: ${creditCurrency} ${creditAmount} fee ${creditFee}`);
      //     this.getExchange(exchangeName).getFiatAccount(creditCurrency).transfer(creditAmount).transfer(-creditFee);
      //     // Logger.log(`Trade fiat credit balance: ${this.getExchange(exchangeName).getFiatAccount(creditCurrency).balance}`);

      //   }
      //   else {  //Exchange cyrptos

      //   }
      // }
    }
  }

  validateLedgerRecords(ledgerRecords) {

    for (let ledgerRecord of ledgerRecords) {
      this.validateLedgerRecord(ledgerRecord);
    }
  }

  validateLedgerRecord(ledgerRecord) {

    let date = ledgerRecord.date;
    let action = ledgerRecord.action;
    let debitCurrency = ledgerRecord.debitCurrency;
    let debitExRate = ledgerRecord.debitExRate;
    let debitAmount = ledgerRecord.debitAmount;
    let debitWalletName = ledgerRecord.debitWalletName;
    let creditCurrency = ledgerRecord.creditCurrency;
    let creditExRate = ledgerRecord.creditExRate;
    let creditAmount = ledgerRecord.creditAmount;
    let creditFee = ledgerRecord.creditFee;
    let creditWalletName = ledgerRecord.creditWalletName;

    // if (isNaN(date)) {
    //   throw Error('Ledger record: missing date.');
    // }
    // else if (!exchangeName) {
    //   throw Error(`[${date.toISOString()}] Ledger record: has no exchange specified.`);
    // }
    // else if (debitCurrency && !this.isFiat(debitCurrency) && !this.isCrypto(debitCurrency)) {
    //   throw Error(`[${date.toISOString()}] Ledger record: debit currency (${debitCurrency}) is not recognized - neither fiat (${this.fiats}) nor crypto (${this.cryptos}).`)
    // }
    // else if (creditCurrency && !this.isFiat(creditCurrency) && !this.isCrypto(creditCurrency)) {
    //   throw Error(`[${date.toISOString()}] Ledger record: credit currency (${creditCurrency}) is not recognized - neither fiat (${this.fiats}) nor crypto (${this.cryptos}).`)
    // }
    // else if (action == 'Transfer') {  //Transfer
    //   if (!debitCurrency && !creditCurrency) {
    //     throw Error(`[${date.toISOString()}] Ledger record : transfer with no currency specified.`);
    //   }
    //   else if (debitCurrency && creditCurrency) {
    //     throw Error(`[${date.toISOString()}] Ledger record: transfer with both debit (${debitCurrency}) and credit (${creditCurrency}) currencies.`);
    //   }
    //   else if ((debitCurrency && this.isFiat(debitCurrency) || creditCurrency && this.isFiat(creditCurrency)) && walletName) { //Fiat transfer
    //     throw Error(`[${date.toISOString()}] Ledger record: fiat transfer has wallet (${walletName}) specified. Leave field blank.`);
    //   }
    //   else if ((debitCurrency && this.isCrypto(debitCurrency) || creditCurrency && this.isCrypto(creditCurrency)) && !walletName) { //Crypto transfer
    //     throw Error(`[${date.toISOString()}] Ledger record: crypto transfer has no wallet specified.`);
    //   }
    //   else if (debitExRate) {
    //     throw Error(`[${date.toISOString()}] Ledger record: transfer. Leave debit exchange rate blank.`);
    //   }
    //   else if (creditExRate) {
    //     throw Error(`[${date.toISOString()}] Ledger record: transfer. Leave credit exchange rate blank.`);
    //   }
    // }
    // else if (action == 'Trade') { //Trade
    //   if (!debitCurrency) {
    //     throw Error(`[${date.toISOString()}] Ledger record: trade with no debit currency specified.`);
    //   }
    //   else if (!creditCurrency) {
    //     throw Error(`[${date.toISOString()}] Ledger record: trade with no credit currency specified.`);
    //   }
    //   else if (this.isFiat(debitCurrency) && this.isFiat(creditCurrency)) {
    //     throw Error(`[${date.toISOString()}] Ledger record: trade with both fiat debit currency (${debitCurrency}) and fiat credit currency (${creditCurrency}) not supported.`);
    //   }
    //   else if (walletName) {
    //     throw Error(`[${date.toISOString()}] Ledger record: trade has wallet (${walletName}) specified. Leave field blank.`);
    //   }
    //   else if (this.isFiat(debitCurrency)) {//Buy crypto
    //     if (this.isFiatConvert(debitCurrency)) {
    //       if (debitExRate) {
    //         throw Error(`[${date.toISOString()}] Ledger record: trade (buy crypto) debit currency (${debitCurrency}) is fiat convert (${this.fiatConvert}). Leave exchange rate blank.`);
    //       }
    //     }
    //     else {
    //       if (!debitExRate || isNaN(debitExRate)) {
    //         throw Error(`[${date.toISOString()}] Ledger record: trade (buy crypto) debit currency (${debitCurrency}) needs a valid fiat convert (${this.fiatConvert}) exchange rate.`);
    //       }
    //     }
    //   }
    //   else if (this.isFiat(creditCurrency)) {//Sell crypto
    //     if (this.isFiatConvert(creditCurrency)) {
    //       if (creditExRate) {
    //         throw Error(`[${date.toISOString()}] Ledger record: trade (sell crypto) credit currency (${creditCurrency}) is fiat convert (${this.fiatConvert}). Leave exchange rate blank.`);
    //       }
    //     }
    //     else {
    //       if (!creditExRate || isNaN(debitExRate)) {
    //         throw Error(`[${date.toISOString()}] Ledger record: trade (sell crypto) credit currency (${creditCurrency}) needs a valid fiat convert (${this.fiatConvert}) exchange rate.`);
    //       }
    //     }
    //   }
    //   else if (this.isCrypto(debitCurrency) && this.isCrypto(creditCurrency)) {  //Exchange cyrptos
    //     if (!debitExRate || isNaN(debitExRate)) {
    //       throw Error(`[${date.toISOString()}] Ledger record: trade (exchange crypto) debit currency (${debitCurrency}) needs a valid fiat convert (${this.fiatConvert}) exchange rate.`);
    //     }
    //     else if (!creditExRate || isNaN(creditExRate)) {
    //       throw Error(`[${date.toISOString()}] Ledger record: trade (exchange crypto) credit currency (${creditCurrency}) needs a valid fiat convert (${this.fiatConvert}) exchange rate.`);
    //     }
    //   }
    // }
    // else {
    //   throw Error(`[${date.toISOString()}] Ledger record: action '${action}' is invalid.`);
    // }
  }

  getLedgerRecords() {

    let ss = SpreadsheetApp.getActive();
    let ledgerSheet = ss.getSheetByName('Ledger');

    let ledgerDataRange = ledgerSheet.getDataRange();
    ledgerDataRange = ledgerDataRange.offset(2, 0, ledgerDataRange.getHeight() - 2, 12);

    let debitExRatesDataRange = ledgerDataRange.offset(0, 3, ledgerDataRange.getHeight(), 1);
    let creditExRatesDataRange = ledgerDataRange.offset(0, 8, ledgerDataRange.getHeight(), 1);

    let ledgerData = ledgerDataRange.getValues();

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
      let creditCurrency = ledgerData[i][6];
      let creditExRate = ledgerData[i][7];

      debitExRates.push([debitExRate]);
      creditExRates.push([creditExRate]);

      if (action == 'Trade') {

        if (this.isFiat(debitCurrency) && !this.isFiatConvert(debitCurrency)) {  //Buy crypto

          if (!debitExRate || isNaN(debitExRate)) {
            debitExRates[i][0] = formula.replace(/#currency#/, debitCurrency).replace(/#fiatConvert#/, this.fiatConvert).replace(/#row#/, (i + 3).toString());
            updateDebitExRates = true;

          }
        }
        else if (this.isFiat(creditCurrency) && !this.isFiatConvert(creditCurrency)) { //Sell crypto

          if (!creditExRate || isNaN(creditExRate)) {
            creditExRates[i][0] = formula.replace(/#currency#/, creditCurrency).replace(/#fiatConvert#/, this.fiatConvert).replace(/#row#/, (i + 3).toString());
            updateCreditExRates = true;
          }
        }
        else if (this.isCrypto(debitCurrency) && this.isCrypto(creditCurrency)) {  //Exchange cyrptos

          if (!debitExRate || isNaN(debitExRate)) {
            debitExRates[i][0] = formula.replace(/#currency#/, debitCurrency).replace(/#fiatConvert#/, this.fiatConvert).replace(/#row#/, (i + 3).toString());
            updateDebitExRates = true;
          }

          if (!creditExRate || isNaN(creditExRate)) {
            creditExRates[i][0] = formula.replace(/#currency#/, creditCurrency.replace(/#fiatConvert#/, this.fiatConvert)).replace(/#row#/, (i + 3).toString());
            updateCreditExRates = true;
          }
        }

      }

      //update if any invalid value found
      if (debitExRate && isNaN(debitExRate)) {
        updateDebitExRates = true;
      }

      if (creditExRate || isNaN(creditExRate)) {
        updateCreditExRates = true;
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

    //read in final results
    ledgerData = ledgerDataRange.getValues();

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

  new CryptoTracker().processTrades();

}
