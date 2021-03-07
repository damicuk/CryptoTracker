class CryptoTracker {

  constructor() {

    this.settings = new Settings();
    this.validateSettings();
    this._wallets = new Map();
    this.incomeLots = [];
    this.closedLots = [];
    this.donatedClosedLots = [];
    this.lotMatching = this.defaultLotMatching;
    this.lotMatchingArray = ['FIFO', 'LIFO', 'HIFO', 'LOFO'];

  }

  get ledgerSheetName() {

    return this.settings['Ledger Sheet'];
  }

  get openPositionsSheetName() {

    return this.settings['Open Positions Sheet'];
  }

  get closedPositionsSheetName() {

    return this.settings['Closed Positions Sheet'];
  }

  get incomeSheetName() {

    return this.settings['Income Sheet'];
  }

  get donationsSheetName() {

    return this.settings['Donations Sheet'];
  }

  get fiatAccountsSheetName() {

    return this.settings['Fiat Accounts Sheet'];
  }

  get currentExRatesSheetName() {

    return this.settings['Current Ex Rates Sheet'];
  }

  get savedExRatesSheetName() {

    return this.settings['Saved Ex Rates Sheet'];
  }

  get saveExRates() {

    return this.settings['Save Ex Rates'];
  }

  get exRateMinutesMargin() {

    return this.settings['Ex Rate Minutes Margin'];
  }

  get accountingCurrency() {

    return this.settings['Accounting Currency'];
  }

  get defaultLotMatching() {

    return this.settings['Default Lot Matching']
  }

  get cryptoCompareApiKey() {

    return this.settings['CryptoCompare ApiKey'];;
  }

  get coinMarketCapApiKey() {

    return this.settings['CoinMarketCap ApiKey'];;
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

  closeLots(lots, debitFee, date, creditWalletName, creditCurrency, creditExRate, creditAmount, creditFee) {

    let closedLots = this.getClosedLots(lots, debitFee, date, creditWalletName, creditCurrency, creditExRate, creditAmount, creditFee);
    this.closedLots = this.closedLots.concat(closedLots);

  }

  donateLots(lots, debitFee, date, creditWalletName, creditCurrency, creditExRate, creditAmount) {

    let closedLots = this.getClosedLots(lots, debitFee, date, creditWalletName, creditCurrency, creditExRate, creditAmount, 0);
    this.donatedClosedLots = this.donatedClosedLots.concat(closedLots);

  }

  getClosedLots(lots, debitFee, date, creditWalletName, creditCurrency, creditExRate, creditAmount, creditFee) {

    let closedLots = [];
    let debitFeeSatoshi = Math.round(debitFee * 1e8);
    let creditAmountSatoshi = Math.round(creditAmount * 1e8);
    let creditFeeSatoshi = Math.round(creditFee * 1e8);

    //get total satoshi in lots
    let lotsSatoshi = 0;
    for (let lot of lots) {

      lotsSatoshi += lot.satoshi;

    }

    //apportion debitFee creditAmount creditFee to lots
    let remainingDebitFeeSatoshi = debitFeeSatoshi;
    let remainingCreditAmountSatoshi = creditAmountSatoshi;
    let remainingCreditFeeSatoshi = creditFeeSatoshi;

    // loop through all except the last lot
    for (let i = 0; i < lots.length - 1; i++) {

      let lot = lots[i];
      let apportionedDebitFeeSatoshi = Math.round((lot.satoshi / lotsSatoshi) * remainingDebitFeeSatoshi);
      let apportionedCreditAmountSatoshi = Math.round((lot.satoshi / lotsSatoshi) * creditAmountSatoshi);
      let apportionedCreditFeeSatoshi = Math.round((lot.satoshi / lotsSatoshi) * creditFeeSatoshi);

      let closedLot = new ClosedLot(lot, (apportionedDebitFeeSatoshi / 1e8), date, creditWalletName, creditCurrency, creditExRate, (apportionedCreditAmountSatoshi / 1e8), (apportionedCreditFeeSatoshi / 1e8));
      closedLots.push(closedLot);

      remainingDebitFeeSatoshi -= apportionedDebitFeeSatoshi;
      remainingCreditAmountSatoshi -= apportionedCreditAmountSatoshi;
      remainingCreditFeeSatoshi -= apportionedCreditFeeSatoshi;

    }
    //just add the remaining amount fee to the last closed lot to correct for any accumulated rounding errors
    let closedLot = new ClosedLot(lots[lots.length - 1], (remainingDebitFeeSatoshi / 1e8), date, creditWalletName, creditCurrency, creditExRate, (remainingCreditAmountSatoshi / 1e8), (remainingCreditFeeSatoshi / 1e8));
    closedLots.push(closedLot);

    return closedLots;

  }

  getLedgerRecords() {

    let ledgerRange = this.getLedgerRange();
    let ledgerData = ledgerRange.getValues();

    //convert raw data to object array
    let ledgerRecords = [];
    for (let row of ledgerData) {

      let ledgerRecord = new LedgerRecord(
        row[0],
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
        row[12]
      );

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
    let ledgerSheet = ss.getSheetByName(this.ledgerSheetName);

    if (!ledgerSheet) {
      throw Error(`Ledger Sheet (${this.ledgerSheetName}) specified in the settings sheet not found.`);
    }

    let ledgerRange = ledgerSheet.getDataRange();
    ledgerRange = ledgerRange.offset(2, 0, ledgerRange.getHeight() - 2, 13);

    return ledgerRange;
  }
}