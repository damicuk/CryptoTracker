/**
 * Represents an amount of cryptocurrency purchased together
 * Calculations are done in satoshi (1/100,000,000) to avoid computational rounding errors
 * @class
 */
class Lot {

  /**
   * @constructor
   * @param {date} date - the date of the transaction
   * @param {string} debitCurrency - The ticker of the fiat or cryptocurrency debited
   * @param {number} debitExRate - The debit currency to accounting currency exchange rate, 0 if the debit currency is the accounting currency
   * @param {number} debitAmount - The amount of fiat or cryptocurrency debited
   * @param {number} debitFee - The fee in the fiat or cryptocurrency debited
   * @param {string} creditCurrency - The ticker of the cryptocurrency credited
   * @param {number} creditAmount - The amount of fiat or cryptocurrency credited
   * @param {number} creditFee - The fee in the fiat or cryptocurrency credited
   * @param {string} walletName - The name of the wallet (or exchange) in which the transaction took place
   */
  constructor(date, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee, walletName) {

    this.date = date;
    this.debitCurrency = debitCurrency;
    this.debitExRate = debitExRate;
    this.debitAmountSatoshi = Math.round(debitAmount * 1e8);
    this.debitFeeSatoshi = Math.round(debitFee * 1e8);
    this.creditCurrency = creditCurrency;
    this.creditAmountSatoshi = Math.round(creditAmount * 1e8);
    this.creditFeeSatoshi = Math.round(creditFee * 1e8);
    this.walletName = walletName;

  }

  /**
   * The balance in the account in satoshi (1/100,000,000)
   * @type {number}
   */
  get satoshi() {

    return this.creditAmountSatoshi - this.creditFeeSatoshi;
  }

  /**
   * The cost basis in cents
   * @type {number}
   */
  get costBasisCents() {

    let exRate = 1;
    if (this.debitExRate) {

      exRate = this.debitExRate;

    }

    return Math.round(((this.debitAmountSatoshi + this.debitFeeSatoshi) * exRate) / 1e6);
  }

  /**
   * Splits a lot into two lots
   * Used when withdrawing an amount from a cryptocurrency account
   * The costs are assigned in proportion to the balances of the returned lots
   * @param {number} satoshi - The balance in satoshi requiered in the first lot of the returned lots
   * @return {Lots[]} Array of two lots, the first having the requested balance, the second with the remainder
   */
  split(satoshi) {

    let splitLots = [];

    let debitAmountSatoshi = Math.round((satoshi / this.satoshi) * this.debitAmountSatoshi);
    let debitFeeSatoshi = Math.round((satoshi / this.satoshi) * this.debitFeeSatoshi);
    let creditFeeSatoshi = Math.round((satoshi / this.satoshi) * this.creditFeeSatoshi);
    let creditAmountSatoshi = satoshi + creditFeeSatoshi;

    let lot1 = new Lot(
      this.date,
      this.debitCurrency,
      this.debitExRate,
      debitAmountSatoshi / 1e8,
      debitFeeSatoshi / 1e8,
      this.creditCurrency,
      creditAmountSatoshi / 1e8,
      creditFeeSatoshi / 1e8,
      this.walletName);

    splitLots.push(lot1);

    let lot2 = new Lot(
      this.date,
      this.debitCurrency,
      this.debitExRate,
      (this.debitAmountSatoshi - lot1.debitAmountSatoshi) / 1e8,
      (this.debitFeeSatoshi - lot1.debitFeeSatoshi) / 1e8,
      this.creditCurrency,
      (this.creditAmountSatoshi - lot1.creditAmountSatoshi) / 1e8,
      (this.creditFeeSatoshi - lot1.creditFeeSatoshi) / 1e8,
      this.walletName);

    splitLots.push(lot2);

    return splitLots;

  }

  /**
   * Duplicates a lot
   * Used to keep a separate account of income lots
   * @return {Lots} A copy of the lot
   */
  duplicate() {

    return new Lot(
      this.date,
      this.debitCurrency,
      this.debitExRate,
      this.debitAmountSatoshi / 1e8,
      this.debitFeeSatoshi / 1e8,
      this.creditCurrency,
      this.creditAmountSatoshi / 1e8,
      this.creditFeeSatoshi / 1e8,
      this.walletName);
  }
}