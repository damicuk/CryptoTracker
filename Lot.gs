/**
 * Represents an amount of cryptocurrency purchased together.
 * Calculations are done in integer amounts of subunits to avoid computational rounding errors.
 */
var Lot = class Lot {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {Date} date - the date of the transaction.
   * @param {string} debitCurrency - The ticker of the fiat or cryptocurrency debited.
   * @param {number} debitExRate - The debit currency to accounting currency exchange rate, 0 if the debit currency is the accounting currency.
   * @param {number} debitAmount - The amount of fiat or cryptocurrency debited.
   * @param {number} debitFee - The fee in the fiat or cryptocurrency debited.
   * @param {string} creditCurrency - The ticker of the cryptocurrency credited.
   * @param {number} creditAmount - The amount of fiat or cryptocurrency credited.
   * @param {number} creditFee - The fee in the fiat or cryptocurrency credited.
   * @param {string} walletName - The name of the wallet (or exchange) in which the transaction took place.
   */
  constructor(date, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee, walletName) {

    this._debitCurrency;
    this._debitCurrencySubunits;
    this._creditCurrency;
    this._creditCurrencySubunits;

    /**
     * The date of the transaction.
     * @type {Date}
     */
    this.date = date;

    /**
     * The ticker of the fiat or cryptocurrency debited.
     * @type {string}
     */
    this.debitCurrency = debitCurrency;

    /**
     * The debit currency to accounting currency exchange rate, 0 if the debit currency is the accounting currency.
     * @type {number}
     */
    this.debitExRate = debitExRate;

    /**
     * The amount of fiat or cryptocurrency debited in subunits.
     * @type {number}
     */
    this.debitAmountSubunits = Math.round(debitAmount * this._debitCurrencySubunits);

    /**
     * The fee in the fiat or cryptocurrency debited in subunits.
     * @type {number}
     */
    this.debitFeeSubunits = Math.round(debitFee * this._debitCurrencySubunits);

    /**
     * The ticker of the cryptocurrency credited.
     * @type {string}
     */
    this.creditCurrency = creditCurrency;

    /**
     * The amount of fiat or cryptocurrency credited in subunits.
     * @type {number}
     */
    this.creditAmountSubunits = Math.round(creditAmount * this._creditCurrencySubunits);

    /**
     * The fee in the fiat or cryptocurrency credited in subunits.
     * @type {number}
     */
    this.creditFeeSubunits = Math.round(creditFee * this._creditCurrencySubunits);

    /**
     * The name of the wallet (or exchange) in which the transaction took place.
     * @type {string}
     */
    this.walletName = walletName;

  }

  get debitCurrency() {

    return this._debitCurrency;
  }

  set debitCurrency(ticker) {

    this._debitCurrency = ticker;
    this._debitCurrencySubunits = Currency.subunits(ticker);

  }

  get creditCurrency() {

    return this._creditCurrency;
  }

  set creditCurrency(ticker) {

    this._creditCurrency = ticker;
    this._creditCurrencySubunits = Currency.subunits(ticker);
  }

  /**
   * The amount of fiat or cryptocurrency debited.
   * @type {number}
   */
  get debitAmount() {

    return this.debitAmountSubunits / this._debitCurrencySubunits;
  }

  /**
   * The fee in the fiat or cryptocurrency debited.
   * @type {number}
   */
  get debitFee() {

    return this.debitFeeSubunits / this._debitCurrencySubunits;
  }

  /**
   * The amount of fiat or cryptocurrency credited.
   * @type {number}
   */
  get creditAmount() {

    return this.creditAmountSubunits / this._creditCurrencySubunits;
  }

  /**
   * The fee in the fiat or cryptocurrency credited.
   * @type {number}
   */
  get creditFee() {

    return this.creditFeeSubunits / this._creditCurrencySubunits;
  }

  /**
   * The balance in the account in subunits.
   * @type {number}
   */
  get subunits() {

    return this.creditAmountSubunits - this.creditFeeSubunits;
  }

  /**
   * The cost basis in subunits.
   * @type {number}
   */
  get costBasisSubunits() {

    let exRate = 1;
    if (this.debitExRate) {

      exRate = this.debitExRate;

    }

    return Math.round((this.debitAmountSubunits + this.debitFeeSubunits) * exRate);
  }

  /**
   * Splits a lot into two lots.
   * Used when withdrawing an amount from a cryptocurrency account.
   * The costs are assigned in proportion to the balances of the returned lots.
   * @param {number} subunits - The balance in subunits required in the first lot of the returned lots.
   * @return {Lots[]} Array of two lots, the first having the requested balance, the second with the remainder.
   */
  split(subunits) {

    let splitLots = [];

    let debitAmountSubunits = Math.round((subunits / this.subunits) * this.debitAmountSubunits);
    let debitFeeSubunits = Math.round((subunits / this.subunits) * this.debitFeeSubunits);

    let creditAmountSubunits = Math.round((subunits / this.subunits) * this.creditAmountSubunits);
    let creditFeeSubunits = creditAmountSubunits - subunits;

    let lot1 = new Lot(
      this.date,
      this.debitCurrency,
      this.debitExRate,
      debitAmountSubunits / this._debitCurrencySubunits,
      debitFeeSubunits / this._debitCurrencySubunits,
      this.creditCurrency,
      creditAmountSubunits / this._creditCurrencySubunits,
      creditFeeSubunits / this._creditCurrencySubunits,
      this.walletName);

    splitLots.push(lot1);

    let lot2 = new Lot(
      this.date,
      this.debitCurrency,
      this.debitExRate,
      (this.debitAmountSubunits - lot1.debitAmountSubunits) / this._debitCurrencySubunits,
      (this.debitFeeSubunits - lot1.debitFeeSubunits) / this._debitCurrencySubunits,
      this.creditCurrency,
      (this.creditAmountSubunits - lot1.creditAmountSubunits) / this._creditCurrencySubunits,
      (this.creditFeeSubunits - lot1.creditFeeSubunits) / this._creditCurrencySubunits,
      this.walletName);

    splitLots.push(lot2);

    return splitLots;

  }

  /**
   * Duplicates a lot.
   * Used to keep a separate account of income lots.
   * @return {Lots} A copy of the lot.
   */
  duplicate() {

    return new Lot(
      this.date,
      this.debitCurrency,
      this.debitExRate,
      this.debitAmountSubunits / this._debitCurrencySubunits,
      this.debitFeeSubunits / this._debitCurrencySubunits,
      this.creditCurrency,
      this.creditAmountSubunits / this._creditCurrencySubunits,
      this.creditFeeSubunits / this._creditCurrencySubunits,
      this.walletName);
  }
};