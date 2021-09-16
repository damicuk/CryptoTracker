/**
 * The main class that processes the Ledger sheet fetches the current crypto prices and writes the reports.
 */
var CryptoTracker = class CryptoTracker {

  /**
   * Initializes class with empty arrays of wallets, income, closed, and donated lots, user properties, and input and output sheet names.
   */
  constructor() {

    /**
     * Collection of Wallets.
     * @type {Array<Obeject>}
     */
    this.wallets = [];

    /**
     * Collection of Lots gained as income.
     * @type {Array<Obeject>}
     */
    this.incomeLots = [];

    /**
     * Collection of ClosedLots.
     * @type {Array<Obeject>}
     */
    this.closedLots = [];

    /**
     * Collection of DocatedLots.
     * @type {Array<Obeject>}
     */
    this.donatedLots = [];

    //get user properties or set defaults
    let userProperties = PropertiesService.getUserProperties();

    /**
     * Currency ticker for the fiat currency used for accounting.
     * Initialized from any saved value in user properties or defaults to 'USD'.
     * @type {string}
     */
    this.accountingCurrency = this.getUserProperty(userProperties, 'accountingCurrency', 'USD');

    /**
     * The default lot matching method.
     * Options are FIFO, LIFO, HIFO, LOFO.
     * Initialized from any saved value in user properties or defaults to 'FIFO'.
     * @type {string}
     */
    this.defaultLotMatching = this.getUserProperty(userProperties, 'defaultLotMatching', 'FIFO');

    /**
     * The API key used to connect to CryptoCompare to retrieve crypto prices.
     * Options are FIFO, LIFO, HIFO, LOFO.
     * Initialized from any saved value in user properties or defaults to 'FIFO'.
     * @type {string}
     */
    this.apiKey = userProperties.getProperty('apiKey');


    /**
     * The current lot matching method.
     * Options are FIFO, LIFO, HIFO, LOFO.
     * @type {string}
     */
    this.lotMatching = this.defaultLotMatching;

    /**
     * The number of header rows in the ledger sheet.
     * @type {number}
     */
    this.ledgerHeaderRows = 2;

    /**
     * The number of data columns in the ledger sheet.
     * @type {number}
     */
    this.ledgerDataColumns = 13;

    /**
     * The number of header rows in the ex rates sheet
     * @type {number}
     */
    this.exRatesSheetHeaderRows = 1;

    /**
     * The number of data columns in the ex rates sheet
     * @type {number}
     */
    this.exRatesSheetDataColumns = 4;

    this.ledgerSheetName = 'Ledger';
    this.exRatesSheetName = 'Ex Rates Data';
    this.fiatAccountsSheetName = 'Fiat Accounts Data';
    this.openPositionsReportName = 'Open Positions Report';
    this.closedPositionsReportName = 'Closed Positions Report';
    this.donationsReportName = 'Donations Report';
    this.incomeReportName = 'Income Report';
    this.openSummaryReportName = 'Open Summary Report';
    this.closedSummaryReportName = 'Closed Summary Report';
    this.incomeSummaryReportName = 'Income Summary Report';
    this.donationsSummaryReportName = 'Donations Summary Report';
    this.cryptoWalletsReportName = 'Crypto Wallets Report';
    this.fiatWalletsReportName = 'Fiat Wallets Report';
    this.exRatesTableSheetName = 'Ex Rates Table';

    this.exRatesRangeName = 'ExRates';
    this.fiatAccountsRangeName = 'FiatAccounts';
    this.openPositionsRangeName = 'OpenPositions';
    this.closedPositionsRangeName = 'ClosedPositions';
    this.donationsRangeName = 'Donations';
    this.incomeRangeName = 'Income';
  }

  /**
   * Gets the value of a user property from a Properties object or sets and returns a default.
   * @param {Properties} userProperties - Properties object from PropertiesService.getUserProperties().
   * @param {string} key - The key of the user property to search.
   * @param {string} defaultValue - The default value to set the user property to if no value is set.
   * @return {string} The value of the user property or the default if not set.
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
   * Array of lot matching options used to determine the order in which lots are withdrawn.
   * FIFO First in first out.
   * LIFO Last in first out.
   * HIFO Highest cost first out.
   * LOFO Lowest cost first out.
   * @type {string[]}
   * @static
   */
  static get lotMatchings() {

    return ['FIFO', 'LIFO', 'HIFO', 'LOFO'];
  }

  /**
   * Comparator used to sort items alphabetically.
   * @param {string} a - The first item to be compared.
   * @param {string} b - The second item to be compared.
   * @return {number} Used to determine the sort order.
   * @static
   */
  static abcComparator(a, b) {
    return a > b ? 1 :
      b > a ? -1 :
        0;
  }

  /**
   * Apportions an integer amount to an array or integers as equitably as possible.
   * e.g. used to apportion fees amoungst lots of cryptocurrency in proportion to the size of the lots.
   * @param {number} integerAmount - The integer amount to divide and apportion.
   * @param {Array<number>} integerArray - The array of integers which determines the distribution of the divided amount.
   * @return {Array<number>} The array of integers that sum to the orignal integer amount, divided as equitably as possible.
   * @static
   */
  static apportionInteger(integerAmount, integerArray) {

    let total = integerArray.reduce((a, b) => a + b, 0);
    let resultArray = [];
    let totalError = -integerAmount;
    let originalIndex = 0;
    for (let integer of integerArray) {

      let float;
      if (total > 0) {
        float = (integer / total) * integerAmount;
      }
      else {
        float = integerAmount / integerArray.length;
      }
      let rounded = Math.round(float);
      let error = rounded - float;

      resultArray.push([rounded, error, originalIndex++]);

      //how much does the total apportioned amount differ from the original input amount?
      totalError += rounded;
    }

    if (totalError < 0) { //negative error means we have to add values
      resultArray.sort(function (a, b) { // sort by error desc (most negative first)
        return a[1] - b[1];
      });
      for (let i = 0; i < -totalError; i++) {
        resultArray[i][0] += 1;
      }
    }
    else if (totalError > 0) { //positive error means we have to subtract values
      resultArray.sort(function (a, b) { //sort by error asc (most positive first)
        return b[1] - a[1];
      });
      for (let i = 0; i < totalError; i++) {
        resultArray[i][0] -= 1;
      }
    }
    resultArray.sort(function (a, b) { //sort back to original order (original index desc)
      return a[2] - b[2];
    });

    //extract the first column with the adjusted rounded values
    let returnArray = [];
    for (let row of resultArray) {
      returnArray.push(row[0]);
    }

    return returnArray;
  }

  /**
   * Set of fiat currency tickers used by this instance.
   * Only filled once processLedger has completed.
   * @type {Set}
   */
  get fiats() {

    let fiats = new Set();
    for (let wallet of this.wallets) {
      for (let fiatAccount of wallet.fiatAccounts) {
        fiats.add(fiatAccount.ticker);
      }
    }
    return fiats;
  }

  /**
   * Set of cryptocurrency tickers used by this instance.
   * Only filled once processLedger has completed.
   * @type {Set}
   */
  get cryptos() {

    let cryptos = new Set();
    for (let wallet of this.wallets) {
      for (let cryptoAccount of wallet.cryptoAccounts) {
        cryptos.add(cryptoAccount.ticker);
      }
    }
    return cryptos;
  }

  /**
   * Set of cryptocurrency tickers with positive balances used by this instance.
   * Only filled once processLedger has completed.
   * @type {Set}
   */
  get currentCryptos() {

    let cryptos = new Set();
    for (let wallet of this.wallets) {
      for (let cryptoAccount of wallet.cryptoAccounts) {
        if (cryptoAccount.balance > 0) {
          cryptos.add(cryptoAccount.ticker);
        }
      }
    }
    return cryptos;
  }

  /**
   * Returns the wallet with the given name or creates adds and returns a new wallet with that name.
   * @param {string} name - The name of the wallet to search for.
   * @return {Wallet} The wallet found or created.
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
   * Wraps the lots that have been sold or exchanged in a ClosedLot objects and adds it to the closedLots collection.
   * The credited amount and fees are assigned to the closed lots in proportion to the size of the lots.
   * @param {lots} lots - The lots that have been sold or exchanged.
   * @param {Date} date - The date of the sale or exchange.
   * @param {string} creditCurrency - The ticker of the fiat or cryptocurrency credited for the lots sold or exchanged.
   * @param {number} creditExRate - The exchange rate of the currency of the lots to the accounting currency at the time of the sale or exchange.
   * @param {number} creditAmount - The amount of the fiat or cryptocurrency credited for the lots sold or exchanged.
   * @param {number} creditFee - The fee in the credited currency for transaction.
   * @param {string} creditWalletName - The name of the wallet (or exchange) where transaction takes place.
   */
  closeLots(lots, date, creditCurrency, creditExRate, creditAmount, creditFee, creditWalletName) {

    let currencySubunits = Currency.subunits(creditCurrency);
    let creditAmountSubunits = Math.round(creditAmount * currencySubunits);
    let creditFeeSubunits = Math.round(creditFee * currencySubunits);

    //apportion the fee to withdrawal lots
    let lotSubunits = [];
    for (let lot of lots) {
      lotSubunits.push(lot.subunits);
    }
    let apportionedCreditAmountSubunits = CryptoTracker.apportionInteger(creditAmountSubunits, lotSubunits);
    let apportionedCreditFeeSubunits = CryptoTracker.apportionInteger(creditFeeSubunits, lotSubunits);
    let index = 0;
    for (let lot of lots) {

      let closedLot = new ClosedLot(lot,
        date,
        creditCurrency,
        creditExRate,
        (apportionedCreditAmountSubunits[index] / currencySubunits),
        (apportionedCreditFeeSubunits[index++] / currencySubunits),
        creditWalletName);

      this.closedLots.push(closedLot);
    }
  }

  /**
   * Wraps the donated lots in a DonatedLot object and adds it to the donatedLots collection.
   * @param {lots} lots - The lots being donated.
   * @param {Date} date - The date of the donation.
   * @param {number} exRate - The exchange rate of the currency of the lots to the accounting currency at the time of the donation.
   * @param {string} walletName - The name of the wallet from which the lots have been donated.
   */
  donateLots(lots, date, exRate, walletName) {

    for (let lot of lots) {

      let donatedLot = new DonatedLot(lot, date, exRate, walletName);
      this.donatedLots.push(donatedLot);

    }
  }

  /**
   * Saves a set of key value pairs as user properties.
   * Validates apiKey setting if attempting to change the existing value.
   * Sends message to the error handler if the api key validation fails.
   * Displays toast on success.
   * @param {Object.<string, string>} settings - The key value pairs to save as user properties .
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
};