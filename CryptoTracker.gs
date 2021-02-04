class CryptoTracker {

  constructor() {

    this.settings = new Settings();
    this.exchanges = new Map();
    this.fiatConvert = this.getFiatConvert();
    //this.exRates = this.getExRates();

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

  getExchange(name) {

    if (!this.exchanges.has(name)) {

      this.exchanges.set(name, new Exchange(name));

    }
    return this.exchanges.get(name);

  }

  // getExRate(date, currency) {

  //   let exRateValue = null;
  //   if (currency != this.fiatConvert) {
  //     for (let exRate of this.exRates) {
  //       if (exRate[0].getTime() == date.getTime()
  //         && exRate[1] == this.fiatConvert
  //         && exRate[2] == currency
  //         && exRate[3] && !isNaN(exRate[3])) {
  //         exRateValue = Number(exRate[3]);
  //         break;
  //       }
  //     }
  //   }
  //   return exRateValue;
  // }

  isFiatConvert(currency) {
    return this.currency == this.fiatConvert;
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

    for (let ledgerRecord of ledgerRecords) {

      let date = ledgerRecord.date;
      let action = ledgerRecord.action;
      let debitCurrency = ledgerRecord.debitCurrency;
      let debitAmount = ledgerRecord.debitAmount;
      let debitFee = ledgerRecord.debitFee;
      let creditCurrency = ledgerRecord.creditCurrency;
      let creditAmount = ledgerRecord.creditAmount;
      let creditFee = ledgerRecord.creditFee;
      let exchangeName = ledgerRecord.exchangeName;
      let walletName = ledgerRecord.walletName;

      this.validateLedgerRecord(date, action, debitCurrency, creditCurrency, exchangeName, walletName);

      // Logger.log(`Date: ${date.toUTCString()}, Action; ${action}, Exchange: ${exchangeName}, Wallet: ${walletName}, Debit Currency: ${debitCurrency}, Credit Currency: ${creditCurrency}`);

      if (action == 'Transfer') {  //Transfer

        if (debitCurrency) { //Withdrawal
          if (this.isFiat(debitCurrency)) { //Fiat withdrawal

            this.getExchange(exchangeName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);
            // Logger.log(`Fiat withdrawal balance: ${this.getExchange(exchangeName).getFiatAccount(debitCurrency).balance}`);

          }
          else if (this.isCrypto(debitCurrency)) { //Crypto withdrawal

          }
        }
        else {  //Deposit
          if (this.isFiat(creditCurrency)) { //Fiat deposit

            this.getExchange(exchangeName).getFiatAccount(creditCurrency).transfer(creditAmount).transfer(-creditFee);
            // Logger.log(`Fiat deposit balance: ${this.getExchange(exchangeName).getFiatAccount(creditCurrency).balance}`);

          }
          else if (this.isCrypto(creditCurrency)) { //Crypto deposit


          }
        }
      }
      else if (action == 'Trade') { //Trade

        if (this.isFiat(debitCurrency) && this.isCrypto(creditCurrency)) {  //Buy crypto

          // Logger.log(`Trade buy crypto, debit: ${debitCurrency} ${debitAmount} fee ${debitFee}, credit: ${creditCurrency} ${creditAmount} fee ${creditFee}`);
          this.getExchange(exchangeName).getFiatAccount(debitCurrency).transfer(-debitAmount).transfer(-debitFee);
          // Logger.log(`Trade fiat debit balance: ${this.getExchange(exchangeName).getFiatAccount(debitCurrency).balance}`);

          //let exRate = this.getExRate(date, debitCurrency);
          // Logger.log(`ExRate [${date.toISOString()}] ${debitCurrency} ${exRate}`);

          // let lot = new Lot(date, debitCurrency, debitAmount, debitFee, creditCurrency, creditAmount, creditFee, exRate);
          // this.getExchange(exchangeName).getCryptoAccount(creditCurrency).deposit(lot);
          // Logger.log(`Trade crypto credit balance: ${this.getExchange(exchangeName).getCryptoAccount(creditCurrency).balance}`);

        }
        else if (this.isCrypto(debitCurrency) && this.isFiat(creditCurrency)) { //Sell crypto

          // Logger.log(`Trade sell crypto, debit: ${debitCurrency} ${debitAmount} fee ${debitFee}, credit: ${creditCurrency} ${creditAmount} fee ${creditFee}`);
          this.getExchange(exchangeName).getFiatAccount(creditCurrency).transfer(creditAmount).transfer(-creditFee);
          // Logger.log(`Trade fiat credit balance: ${this.getExchange(exchangeName).getFiatAccount(creditCurrency).balance}`);

        }
        else {  //Exchange cyrptos

        }
      }
    }
  }

  validateLedgerRecords(ledgerRecords) {




  }

  validateLedgerRecord(date, action, debitCurrency, creditCurrency, exchangeName, walletName) {

    if (isNaN(date)) {
      throw Error('Ledger record: missing date.');
    }
    else if (!exchangeName) {
      throw Error(`[${date.toISOString()}] Ledger record: has no exchange specified.`);
    }
    else if (debitCurrency && !this.isFiat(debitCurrency) && !this.isCrypto(debitCurrency)) {
      throw Error(`[${date.toISOString()}] Ledger record: debit currency (${debitCurrency}) is not recognized - neither fiat (${this.fiats}) nor crypto (${this.cryptos}).`)
    }
    else if (creditCurrency && !this.isFiat(creditCurrency) && !this.isCrypto(creditCurrency)) {
      throw Error(`[${date.toISOString()}] Ledger record: credit currency (${creditCurrency}) is not recognized - neither fiat (${this.fiats}) nor crypto (${this.cryptos}).`)
    }
    else if (action == 'Transfer') {  //Transfer
      if (!debitCurrency && !creditCurrency) {
        throw Error(`[${date.toISOString()}] Ledger record : transfer with no currency specified.`);
      }
      else if (debitCurrency && creditCurrency) {
        throw Error(`[${date.toISOString()}] Ledger record: transfer with both debit (${debitCurrency}) and credit (${creditCurrency}) currencies.`);
      }
      else if ((debitCurrency && this.isFiat(debitCurrency) || creditCurrency && this.isFiat(creditCurrency)) && walletName) { //Fiat transfer
        throw Error(`[${date.toISOString()}] Ledger record: fiat transfer has wallet (${walletName}) specified. Leave field blank.`);
      }
      else if ((debitCurrency && this.isCrypto(debitCurrency) || creditCurrency && this.isCrypto(creditCurrency)) && !walletName) { //Crypto transfer
        throw Error(`[${date.toISOString()}] Ledger record: crypto transfer has no wallet specified.`);
      }
    }
    else if (action == 'Trade') { //Trade
      if (!debitCurrency) {
        throw Error(`[${date.toISOString()}] Ledger record: trade with no debit currency specified.`);
      }
      else if (!creditCurrency) {
        throw Error(`[${date.toISOString()}] Ledger record: trade with no credit currency specified.`);
      }
      else if (this.isFiat(debitCurrency) && this.isFiat(creditCurrency)) {
        throw Error(`[${date.toISOString()}] Ledger record: trade with both fiat debit currency (${debitCurrency}) and fiat credit currency (${creditCurrency}) not supported.`);
      }
      else if (walletName) {
        throw Error(`[${date.toISOString()}] Ledger record: trade has wallet (${walletName}) specified. Leave field blank.`);
      }
    }
    else {
      throw Error(`[${date.toISOString()}] Ledger record: action '${action}' is invalid.`);
    }
  }

//   getExRates() {

//     let ledgerData = this.getLedgerData();

//     let neededRates = [];

//     for (let row of ledgerData) {

//       let date = new Date(row[0]);
//       let action = row[1];
//       let debitCurrency = row[2];
//       let creditCurrency = row[5];
//       let exchangeName = row[8];
//       let walletName = row[9];

//       this.validateLedgerRecord(date, action, debitCurrency, creditCurrency, exchangeName, walletName);

//       if (action == 'Trade') {

//         if (this.isFiat(debitCurrency) && !this.isFiatConvert(debitCurrency)) {  //Buy crypto

//           neededRates.push([date, this.fiatConvert, debitCurrency, '']);
//           // Logger.log(`Date: ${date.toISOString()}, Fiat Convert: ${this.fiatConvert}, Debit Currency: ${debitCurrency}`);

//         }
//         else if (this.isFiat(creditCurrency) && !this.isFiatConvert(creditCurrency)) { //Sell crypto

//           neededRates.push([date, this.fiatConvert, creditCurrency, '']);
//           // Logger.log(`Date: ${date.toISOString()}, Fiat Convert: ${this.fiatConvert}, Credit Currency: ${creditCurrency}`);

//         }
//         else if (this.isCrypto(debitCurrency) && this.isCrypto(creditCurrency)) {  //Exchange cyrptos

//           neededRates.push([date, this.fiatConvert, debitCurrency, '']);
//           // Logger.log(`Date: ${date.toISOString()}, Fiat Convert: ${this.fiatConvert}, Debit Currency: ${debitCurrency}`);

//           neededRates.push([date, this.fiatConvert, creditCurrency, '']);
//           // Logger.log(`Date: ${date.toISOString()}, Fiat Convert: ${this.fiatConvert}, Credit Currency: ${creditCurrency}`);

//         }
//       }
//     }

//     let ss = SpreadsheetApp.getActive();
//     const exRatesSheetName = 'Ex Rates';
//     let exRatesSheet = ss.getSheetByName(exRatesSheetName);

//     if (!exRatesSheet) {
//       exRatesSheet = ss.insertSheet(exRatesSheetName);
//     }

//     //existing data
//     let exRatesDataRange = exRatesSheet.getDataRange();

//     //append needed rates
//     let neededRateDataRange = exRatesSheet.getRange(exRatesDataRange.getHeight(), 1, neededRates.length, 4);
//     neededRateDataRange.setValues(neededRates);

//     //remove rows with duplicate values in columns A-C
//     exRatesSheet.getDataRange().removeDuplicates([1, 2, 3]);

//     //data range without duplicates
//     exRatesDataRange = exRatesSheet.getDataRange();

//     //column D contains calculated values or empty where value yet to be calculated
//     let rateValuesDataRange = exRatesSheet.getRange(1, 4, exRatesDataRange.getHeight(), 1);
//     let rateValues = rateValuesDataRange.getValues();

//     //add formula to calculate missing values
//     const formula = `=Index(GoogleFinance(CONCAT("CURRENCY:", CONCAT(B#, C#)), "close", A#), 2,2)`;
//     const regEx = /#/g;

//     for (let i = 0; i < rateValues.length; i++) {
//       let rateValue = rateValues[i][0];
//       if (!rateValue || isNaN(rateValue)) {
//         rateValues[i][0] = formula.replace(regEx, (i + 1).toString());
//       }
//     }

//     //apply the formula to calculate the values
//     rateValuesDataRange.setFormulas(rateValues);
//     SpreadsheetApp.flush(); //applies changes

//     //read in values calculated by the formula
//     rateValues = rateValuesDataRange.getValues();

//     //remove failed formula results
//     for (let rateValue of rateValues) {
//       if (isNaN(rateValue[0])) {
//         rateValue[0] = '';
//       }
//     }

//     //overwrite the formulas with hard coded values
//     rateValuesDataRange.setValues(rateValues);
//     SpreadsheetApp.flush(); //applies changes

//     //read in final results
//     return exRatesDataRange.getValues();

//   }

  getLedgerRecords() {

    let ss = SpreadsheetApp.getActive();
    let ledgerSheet = ss.getSheetByName('Ledger');

    let ledgerDataRange = ledgerSheet.getDataRange();
    let ledgerData = ledgerDataRange.offset(2, 0, ledgerDataRange.getHeight() - 2, 12).getValues();

    ledgerData.sort(function (a, b) { //sort by date
      return a[0] - b[0];
    });

    let ledgerRecords = [];
    for(let row of ledgerData) {

      let ledgerRecord = new LedgerRecord(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11]);
      ledgerRecords.push(ledgerRecord);

    }

    return ledgerRecords;
  }

}

function processTrades() {

  new CryptoTracker().processTrades();

}
