/**
 * A collection of static utility functions for currencies.
 */
var Currency = class Currency {
  constructor() {
  }

  /**
   * Array of supported fiat currency tickers.
   * Limited to those supported by CryptoCompare.
   * @type {string[]}
   * @static
   */
  static get validFiats() {

    return ['USD', 'EUR', 'CAD', 'AUD', 'GBP', 'CHF', 'JPY'];
  }

  /**
   * Regular expression to loosly validate cryptocurrency format.
   * @type {RegExp}
   * @static
   */
  static get cryptoRegExp() {

    return /^\w{2,9}$/;
  }

  /**
   * Determines whether the currency ticker is a valid fiat.
   * Only fiat currencies in the valid fiats list those supported by CryptoComapre will return true.
   * @param {string} ticker - The currency ticker in question.
   * @return {boolean} Whether the currency is a valid fiat currency.
   * @static
   */
  static isFiat(ticker) {

    return Currency.validFiats.includes(ticker);
  }

  /**
   * Determines whether the currency ticker is a valid cryptocurrency.
   * All currencies that are not valid fiats and pass the loose regular expresion validation will return true.
   * @param {string} ticker - The currency ticker in question.
   * @return {boolean} Whether the currency is a valid cryptocurrency.
   * @static
   */
  static isCrypto(ticker) {

    return !Currency.validFiats.includes(ticker) && Currency.cryptoRegExp.test(ticker);
  }

  /**
   * Returns the valid number of decimal digits of a given currency ticker.
   * @param {string} ticker - The fiat or cryptocurrency ticker.
   * @return {number} - The valid number of decimal digits.
   * @static
   */
  static decimalDigits(ticker) {

    if (ticker === 'JPY') {
      return 0;
    }
    else if (ticker === 'ADA') {
      return 6;
    }
    else if (Currency.isFiat(ticker)) {
      return 2;
    }
    else {
      return 8;
    }
  }

  /**
   * Returns the number of subunit in a unit of a given currency ticker (e.g 100 cents in 1 USD, or 100,000,000 satoshi in 1 BTC).
   * @param {string} ticker - The fiat or cryptocurrency ticker.
   * @return {number} - The number of subunit in a unit of the currency ticker (e.g 100 cents in 1 USD, or 100,000,000 satoshi in 1 BTC).
   * @static
   */
  static subunits(ticker) {

    return 10 ** Currency.decimalDigits(ticker);
  }
};