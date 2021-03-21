/**
 * Represents a fiat account
 * Calculation are done in cents to avoid computational rounding errors
 * @class
 */
class FiatAccount {

  /**
   * @constructor Sets the fiat currency and initializes the balance to 0
   * @param {string} fiat - the fiat currency ticker
   */
  constructor(fiat) {

    this.fiat = fiat;
    this.cents = 0;

  }

  /**
   * The balance in the account
   * @type {number}
   */
  get balance() {

    return this.cents / 100;

  }

  /**
   * Adjusts the balance in the account
   * @param {number} amount - Deposits the amount if positive or withdraws the amount if negative
   * @return {FiatAccount} Returns this instance for chaining
   */
  transfer(amount) {

    this.cents += Math.round(amount * 100); //round because multiplying

    return this;

  }
}
