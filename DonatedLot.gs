/**
 * Represents an amount of cryptocurrency that has been donated to a charity.
 */
var DonatedLot = class DonatedLot {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {Lot} lot - An amount of cryptocurrency purchased together.
   * @param {date} date - the date of the donation.
   * @param {number} exRate - The lot currency to accounting currency exchange rate.
   * @param {string} walletName - The name of the wallet (or exchange) from which the donation was debited.
   */
  constructor(lot, date, exRate, walletName) {

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
     * The lot currency to accounting currency exchange rate.
     * @type {number}
     */
    this.exRate = exRate;

    /**
     * The name of the wallet (or exchange) from which the donation was debited.
     * @type {string}
     */
    this.walletName = walletName;

  }
}
