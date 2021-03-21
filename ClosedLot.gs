/**
 * Represents an amount of cryptocurrency that has been sold or exchanged
 * Calculations are done in satoshi (1/100,000,000) to avoid computational rounding errors
 * @class
 */
class ClosedLot {

  /**
   * @constructor
   * @param {Lot} lot - An amount of cryptocurrency purchased together
   * @param {date} date - the date of the sale or exchange
   * @param {string} creditCurrency - The ticker of the fiat or cryptocurrency credited
   * @param {number} creditExRate - The credit currency to accounting currency exchange rate, 0 if the credit currency is the accounting currency
   * @param {number} creditAmount - The amount of fiat or cryptocurrency credited
   * @param {number} creditFee - The fee in the fiat or cryptocurrency credited
   * @param {string} walletName - The wallet (or exchange) in which the transaction took place
   */
  constructor(lot, date, creditCurrency, creditExRate, creditAmount, creditFee, walletName) {

    this.lot = lot;
    this.date = date;
    this.creditCurrency = creditCurrency;
    this.creditExRate = creditExRate;
    this.creditAmountSatoshi = Math.round(creditAmount * 1e8);
    this.creditFeeSatoshi = Math.round(creditFee * 1e8);
    this.walletName = walletName;

  }
}
