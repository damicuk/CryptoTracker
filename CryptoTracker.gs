class CryptoTracker {

  constructor() {

    this._wallets = new Map();
    this.incomeLots = new Array();
    this.closedLots = new Array();
    this.donatedLots = new Array();

    this.validFiats = new Set(['USD', 'EUR', 'CAD', 'AUD', 'GBP', 'CHF','JPY']);

    //get user properties or set defaults
    let userProperties = PropertiesService.getUserProperties();
    this.accountingCurrency = this.getUserProperty(userProperties, 'accountingCurrency', 'USD');
    this.defaultLotMatching = this.getUserProperty(userProperties, 'defaultLotMatching', 'FIFO');

    let fiatList = this.getUserProperty(userProperties, 'fiats', 'EUR,USD');
    this.fiats = new Set(fiatList.split(","));

    let cryptoList = this.getUserProperty(userProperties, 'cryptos', 'ADA,BTC,ETH');
    this.cryptos = new Set(cryptoList.split(","));

    this.apiProvider = userProperties.getProperty('apiProvider');
    this.apiKey = userProperties.getProperty('apiKey');

    this.lotMatching = this.defaultLotMatching;

    //sheet names
    this.ledgerSheetName = 'Ledger';
    this.openPositionsSheetName = 'Open Positions Data';
    this.closedPositionsSheetName = 'Closed Positions Data';
    this.incomeSheetName = 'Income Data';
    this.donationsSheetName = 'Donations Data';
    this.fiatAccountsSheetName = 'Fiat Accounts Data';
    this.exRatesSheetName = 'Ex Rates Data';
    this.openPositionsReportName = 'Open Positions Report';
    this.closedPositionsReportName = 'Closed Positions Report';
    this.donationsReportName = 'Donations Report';
    this.incomeReportName = 'Income Report'
    this.openSummaryReportName = 'Open Summary Report';
    this.closedSummaryReportName = 'Closed Summary Report';
    this.incomeSummaryReportName = 'Income Summary Report';
    this.donationsSummaryReportName = 'Donations Summary Report';
    this.cryptoWalletsReportName = 'Crypto Wallets Report';
    this.fiatWalletsReportName = 'Fiat Wallets Report';
    this.openPLReportName = 'Open P/L Report';
    this.closedPLReportName = 'Closed P/L Report';
    this.exRatesTableSheetName = 'Ex Rates Table';
  }

  getUserProperty(userProperties, key, defaultValue) {

    let value = userProperties.getProperty(key);

    if (value) {

      return value;

    }
    else {

      userProperties.setProperty(key, defaultValue);
      return defaultValue;

    }
  }

  static get lotMatchings() {

    return ['FIFO', 'LIFO', 'HIFO', 'LOFO'];
  }

  get wallets() {

    return Array.from(this._wallets.values());
  }

  get walletNames() {

    return Array.from(this._wallets.keys());
  }

  getWallet(name) {

    if (!this._wallets.has(name)) {

      this._wallets.set(name, new Wallet(name));

    }
    return this._wallets.get(name);
  }

  isFiat(currency) {

    return this.validFiats.has(currency);
  }

  isCrypto(currency) {

    return !this.validFiats.has(currency);
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


  payLots(lots, date, exRate, amount, fee, walletName) {

    //convert amount and fee to accounting currency
    let creditAmountCents = Math.round(exRate * amount * 100);
    let creditFeeCents = Math.round(exRate * fee * 100);

    this.closeLots(lots, date, this.accountingCurrency, 0, (creditAmountCents / 100), (creditFeeCents / 100), walletName);

  }

  donateLots(lots, date, exRate, walletName) {

    for (let lot of lots) {

      let donatedLot = new DonatedLot(lot, date, exRate, walletName);
      this.donatedLots.push(donatedLot);

    }
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
      throw Error(`${this.ledgerSheetName} Sheet not found.`);
    }

    let ledgerRange = ledgerSheet.getDataRange();
    ledgerRange = ledgerRange.offset(2, 0, ledgerRange.getHeight() - 2, 13);

    return ledgerRange;
  }
}