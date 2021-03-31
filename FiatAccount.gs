/**
 * Fiat currency account.
 * Calculation are done in cents to avoid computational rounding errors.
 */
class FiatAccount {

  /**
   * Sets the fiat currency and initializes the balance to 0.
   * @param {string} fiat - the fiat currency ticker.
   */
  constructor(fiat) {

    /**
     * The fiat currency ticker.
     * @type {string}
     */
    this.fiat = fiat;

    /**
     * The balance in the account in cents.
     * @type {number}
     */
    this.cents = 0;

  }

  /**
   * The balance in the account.
   * @type {number}
   */
  get balance() {

    return this.cents / 100;

  }

  /**
   * Adjusts the balance in the account.
   * @param {number} amount - Deposits the amount if positive or withdraws the amount if negative.
   * @return {FiatAccount} Returns this instance for chaining.
   */
  transfer(amount) {

    this.cents += Math.round(amount * 100); //round because multiplying

    return this;

  }
}
