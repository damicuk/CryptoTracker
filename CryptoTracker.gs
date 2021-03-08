class CryptoTracker {

  constructor() {

    this.settings = new Settings();
    this.validateSettings();
    this._wallets = new Map();
    this.incomeLots = new Array();
    this.closedLots = new Array();
    this.donatedLots = new Array();
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

  closeLots(lots, date, creditCurrency, creditExRate, creditAmount, creditFee, creditWalletName) {

    let creditAmountSatoshi = Math.round(creditAmount * 1e8);
    let creditFeeSatoshi = Math.round(creditFee * 1e8);

    //get total satoshi in lots
    let lotsSatoshi = 0;
    for (let lot of lots) {

      lotsSatoshi += lot.satoshi;

    }

    //apportion creditAmount creditFee to lots
    let remainingCreditAmountSatoshi = creditAmountSatoshi;
    let remainingCreditFeeSatoshi = creditFeeSatoshi;

    // loop through all except the last lot
    for (let i = 0; i < lots.length - 1; i++) {

      let lot = lots[i];
      let apportionedCreditAmountSatoshi = Math.round((lot.satoshi / lotsSatoshi) * creditAmountSatoshi);
      let apportionedCreditFeeSatoshi = Math.round((lot.satoshi / lotsSatoshi) * creditFeeSatoshi);

      let closedLot = new ClosedLot(lot, date, creditCurrency, creditExRate, (apportionedCreditAmountSatoshi / 1e8), (apportionedCreditFeeSatoshi / 1e8), creditWalletName);
      this.closedLots.push(closedLot);

      remainingCreditAmountSatoshi -= apportionedCreditAmountSatoshi;
      remainingCreditFeeSatoshi -= apportionedCreditFeeSatoshi;

    }
    //just add the remaining amount fee to the last closed lot to correct for any accumulated rounding errors
    let closedLot = new ClosedLot(lots[lots.length - 1], date, creditCurrency, creditExRate, (remainingCreditAmountSatoshi / 1e8), (remainingCreditFeeSatoshi / 1e8), creditWalletName);
    this.closedLots.push(closedLot);

  }


  donateLots(lots, date, exRate, walletName) {

    for (let lot of lots) {

      let donatedLot = new DonatedLot(lot, date, exRate, walletName);
      this.donatedLots.push(donatedLot);

    }
  }

  payLots(lots, date, exRate, amount, fee, walletName) {

    //convert amount and fee to accounting currency
    let creditAmountCents = Math.round(exRate * amount * 100);
    let creditFeeCents = Math.round(exRate * fee * 100);

    this.closeLots(lots, date, this.accountingCurrency, 0, (creditAmountCents / 100), (creditFeeCents / 100), walletName);

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