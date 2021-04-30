/**
 * Fiat currency account.
 * Calculation are done in integer amounts of subunits to avoid computational rounding errors.
 */
var FiatAccount = class FiatAccount {

  /**
   * Sets the fiat currency and initializes the balance to 0.
   * @param {string} ticker - the fiat currency ticker.
   */
  constructor(ticker) {

    /**
     * The fiat currency ticker.
     * @type {string}
     */
    this.ticker = ticker;


    /**
     * The number of subunit in a unit of the currency (e.g 100 cents in 1 USD).
     * @type {number}
     * @static
     */
    this.currencySubunits = Currency.subunits(ticker);

    /**
     * The balance in the account in subunits.
     * @type {number}
     */
    this.subunits = 0;

  }

  /**
   * The balance in the account.
   * @type {number}
   */
  get balance() {

    return this.subunits / this.currencySubunits;

  }

  /**
   * Adjusts the balance in the account.
   * @param {number} amount - Deposits the amount if positive or withdraws the amount if negative.
   * @return {FiatAccount} Returns this instance for chaining.
   */
  transfer(amount) {

    this.subunits += Math.round(amount * this.currencySubunits); //round because multiplying

    return this;

  }
}
