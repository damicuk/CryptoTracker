/**
 * The main class that processes the Ledger sheet fetches the current crypto prices and writes the reports
 * @class
 */
class CryptoTracker {

  /**
   * @constructor Initializes class with empty arrays of wallets, income, closed, and donated lots, user properties, and input and output sheet names
   */
  constructor() {

    this.wallets = new Array();
    this.incomeLots = new Array();
    this.closedLots = new Array();
    this.donatedLots = new Array();

    //get user properties or set defaults
    let userProperties = PropertiesService.getUserProperties();
    this.accountingCurrency = this.getUserProperty(userProperties, 'accountingCurrency', 'USD');
    this.defaultLotMatching = this.getUserProperty(userProperties, 'defaultLotMatching', 'FIFO');
    this.apiKey = userProperties.getProperty('apiKey');

    this.lotMatching = this.defaultLotMatching;

    this.ledgerSheetName = 'Ledger';
    this.exRatesSheetName = 'Ex Rates Data';
    this.fiatAccountsSheetName = 'Fiat Accounts Data'
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

    this.exRatesRangeName = 'ExRates';
    this.fiatAccountsRangeName = 'FiatAccounts';
    this.openPositionsRangeName = 'OpenPositions';
    this.closedPositionsRangeName = 'ClosedPositions';
    this.donationsRangeName = 'Donations';
    this.incomeRangeName = 'Income';
  }


  /**
   * Gets the value of a user property from a Properties object or sets and returns a default
   * @param {Properties} userProperties - Properties object from PropertiesService.getUserProperties()
   * @param {string} key - The key of the user property to search
   * @param {string} defaultValue - The default value to set the user property to if no value is set
   * @return {string} The value of the user property or the default if not set
   */
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

  /**
   * Array of lot matching options used to determine the order in which lots are withdrawn
   * FIFO First in first out
   * LIFO Last in first out
   * HIFO Highest cost first out
   * LOFO Lowest cost first out
   * @type {string[]}
   * @static
   */
  static get lotMatchings() {

    return ['FIFO', 'LIFO', 'HIFO', 'LOFO'];
  }

  /**
   * Array of supported fiat currency tickers
   * Limited to those supported by CryptoCompare
   * @type {string[]}
   * @static
   */
  static get validFiats() {

    return ['USD', 'EUR', 'CAD', 'AUD', 'GBP', 'CHF', 'JPY'];
  }

  /**
   * Regular expression to loosly validate cryptocurrency format
   * @type {RegExp}
   * @static
   */
  static get cryptoRegExp() {

    return /^\w{2,9}$/;
  }

  /**
   * Comparator used to sort items alphabetically
   * @param {string} a - The first item to be compared
   * @param {string} b - The second item to be compared
   * @return {number} - Used to determine the sort order
   * @static
   */
  static abcComparator(a, b) {
    return a > b ? 1 :
      b > a ? -1 :
        0;
  }

  /**
   * Set of fiat currency tickers used by this instance
   * Only filled once processLedger has completed
   * @type {Set}
   */
  get fiats() {

    let fiats = new Set();
    for (let wallet of this.wallets) {
      for (let fiatAccount of wallet.fiatAccounts) {
        fiats.add(fiatAccount.fiat);
      }
    }
    return fiats;
  }

  /**
   * Set of cryptocurrency tickers used by this instance
   * Only filled once processLedger has completed
   * @type {Set}
   */
  get cryptos() {

    let cryptos = new Set();
    for (let wallet of this.wallets) {
      for (let cryptoAccount of wallet.cryptoAccounts) {
        cryptos.add(cryptoAccount.crypto);
      }
    }
    return cryptos;
  }

  /**
   * Returns the wallet with the given name or creates adds and returns a new wallet with that name
   * @param {string} name - The name of the wallet to search for
   * @return {Wallet} The wallet found or created   
   */
  getWallet(name) {

    for (let wallet of this.wallets) {
      if (wallet.name === name) {
        return wallet;
      }
    }

    let wallet = new Wallet(name);
    this.wallets.push(wallet);
    return wallet;

  }

  /**
   * Determines whether the currency ticker is a valid fiat
   * Only fiat currencies in the valid fiats list those supported by CryptoComapre will return true
   * @param {string} currency - The currency ticker in question
   * @return {boolean} Whether the currency is a valid fiat currency
   */
  isFiat(currency) {

    return CryptoTracker.validFiats.includes(currency);
  }

  /**
   * Determines whether the currency ticker is a valid cryptocurrency
   * All currencies that are not valid fiats and pass the loose regular expresion validation will return true
   * @param {string} currency - The currency ticker in question
   * @return {boolean} Whether the currency is a valid cryptocurrency
   */
  isCrypto(currency) {

    return !CryptoTracker.validFiats.includes(currency)
      && CryptoTracker.cryptoRegExp.test(currency);
  }

  /**
   * Wraps the lots that have been sold or exchanged in a ClosedLot objects and adds it to the closedLots collection
   * The credited amount and fees are assigned to the closed lots in proportion to the size of the lots 
   * @param {lots} lots - The lots that have been sold or exchanged
   * @param {date} date - The date of the sale or exchange
   * @param {string} creditCurrency - The ticker of the fiat or cryptocurrency credited for the lots sold or exchanged
   * @param {number} exRate - The exchange rate of the currency of the lots to the accounting currency at the time of the sale or exchange
   * @param {number} creditAmount - The amount of the fiat or cryptocurrency credited for the lots sold or exchanged
   * @param {number} creditFee - The fee in the credited currency for transaction
   * @param {string} walletName - The name of the wallet (or exchange) where transaction takes place
   */
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

  /**
   * Wraps the lots that have been exchanged for goods or services in ClosedLot objects and adds it to the closedLots collection
   * The transaction is treated the same as a sale or exchange for the current fair value of the lots in the accounting currency
   * @param {lots} lots - The lots that have been exchanged
   * @param {date} date - The date of the exchange
   * @param {number} exRate - The exchange rate of the currency of the lots to the accounting currency at the time of the exchange
   * @param {number} creditAmount - The amount of cryptocurrency exchanged for the goods or services
   * @param {number} creditFee - The cryptocurrency fee for transaction
   * @param {string} walletName - The name of the wallet (or exchange) from which the lots are debited
   */
  payLots(lots, date, exRate, amount, fee, walletName) {

    //convert amount and fee to accounting currency
    let creditAmountCents = Math.round(exRate * amount * 100);
    let creditFeeCents = Math.round(exRate * fee * 100);

    this.closeLots(lots, date, this.accountingCurrency, 0, (creditAmountCents / 100), (creditFeeCents / 100), walletName);

  }

  /**
   * Wraps the donated lots in a DonatedLot object and adds it to the donatedLots collection
   * @param {lots} lots - The lots being donated
   * @param {date} date - The date of the donation
   * @param {number} exRate - The exchange rate of the currency of the lots to the accounting currency at the time of the donation
   * @param {string} walletName - The name of the wallet from which the lots have been donated
   */
  donateLots(lots, date, exRate, walletName) {

    for (let lot of lots) {

      let donatedLot = new DonatedLot(lot, date, exRate, walletName);
      this.donatedLots.push(donatedLot);

    }
  }

  /**
   * Saves a set of key value pairs as user properties
   * Validates apiKey setting if attempting to change the existing value
   * Sends message to the error handler if the api key validation fails
   * Displays toast on success
   * @param {Object.<string, string>} settings - The key value pairs to save as user properties 
   */
  saveSettings(settings) {

    let userProperties = PropertiesService.getUserProperties();

    if (settings.apiKey && settings.apiKey !== userProperties.apiKey) {

      let apiKeyValid = this.validateApiKey(settings.apiKey);

      if (!apiKeyValid) {

        this.handleError('settings', 'Invalid API key');
        return;
      }
    }

    userProperties.setProperties(settings);
    SpreadsheetApp.getActive().toast('Settings saved');
  }
}