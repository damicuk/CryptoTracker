/**
 * Represents an amount of cryptocurrency that has been sold or exchanged.
 * Calculations are done in satoshi (1/100,000,000) to avoid computational rounding errors.
 */
class ClosedLot {

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
     * The amount of fiat or cryptocurrency credited in satoshi (1/100,000,000).
     * @type {number}
     */
    this.creditAmountSatoshi = Math.round(creditAmount * 1e8);

    /**
     * The fee in the fiat or cryptocurrency credited in satoshi (1/100,000,000).
     * @type {number}
     */
    this.creditFeeSatoshi = Math.round(creditFee * 1e8);

    /**
     * The name of the wallet (or exchange) in which the transaction took place.
     * @type {string}
     */
    this.walletName = walletName;

  }
}
