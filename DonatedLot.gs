/**
 * Represents an amount of cryptocurrency that has been donated to a charity
 * @class
 */
class DonatedLot {

  /**
   * @constructor
   * @param {Lot} lot - An amount of cryptocurrency purchased together
   * @param {date} date - the date of the donation
   * @param {number} exRate - The lot currency to accounting currency exchange rate
   * @param {string} walletName - The name of the wallet (or exchange) from which the donation was debited
   */
  constructor(lot, date, exRate, walletName) {

    this.lot = lot;
    this.date = date;
    this.exRate = exRate;
    this.walletName = walletName;

  }
}
