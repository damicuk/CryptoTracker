/**
 * Represents an amount of cryptocurrency that has been sold or exchanged.
 * Calculations are done in integer amounts of subunits to avoid computational rounding errors.
 */
var ClosedLot = class ClosedLot {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {Lot} lot - An amount of cryptocurrency purchased together.
   * @param {Date} date - the date of the sale or exchange.
   * @param {string} creditCurrency - The ticker of the fiat or cryptocurrency credited.
   * @param {number} creditExRate - The credit currency to accounting currency exchange rate, 0 if the credit currency is the accounting currency.
   * @param {number} creditAmount - The amount of fiat or cryptocurrency credited.
   * @param {number} creditFee - The fee in the fiat or cryptocurrency credited.
   * @param {string} walletName - The name of the wallet (or exchange) in which the transaction took place.
   */
  constructor(lot, date, creditCurrency, creditExRate, creditAmount, creditFee, walletName) {

    this._creditCurrency;
    this._creditCurrencySubunits;

    /**
     * An amount of cryptocurrency purchased together.
     * @type {Lot}
     */
    this.lot = lot;

    /**
     * The date of the sale or exchange.
     * @type {Date}
     */
    this.date = date;

    /**
     * The ticker of the fiat or cryptocurrency credited.
     * @type {string}
     */
    this.creditCurrency = creditCurrency;

    /**
     * The credit currency to accounting currency exchange rate, 0 if the credit currency is the accounting currency.
     * @type {number}
     */
    this.creditExRate = creditExRate;

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

  get creditCurrency() {

    return this._creditCurrency;
  }

  set creditCurrency(ticker) {

    this._creditCurrency = ticker;
    this._creditCurrencySubunits = Currency.subunits(ticker);
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
};