/**
 * Cryptocurrency account.
 * Calculation are done in satoshi (1/100,000,000) to avoid computational rounding errors.
 */
class CryptoAccount {

  /**
   * Sets the cryptocurrency currency and initializes an empty array to contain the crytocurrency lots.
   * @param {string} crypto - the cryptocurrency currency ticker.
   */
  constructor(crypto) {

    /**
     * The cryptocurrency currency ticker.
     * @type {string}
     */
    this.crypto = crypto;

    /**
     * The crytocurrency lots.
     * @type {Array<Lot>}
     */
    this.lots = [];

  }

  /**
   * The balance in the account in satoshi (1/100,000,000).
   * @type {number}
   */
  get satoshi() {

    let satoshi = 0;
    for (let lot of this.lots) {

      satoshi += lot.satoshi; //adding two integers - no need to round

    }
    return satoshi;
  }

  /**
   * The balance in the account.
   * @type {number}
   */
  get balance() {

    return this.satoshi / 1e8;
  }

  /**
   * Deposits a single or multiple lots of cryptocurrency into the account.
   * @param {(Lot|Lot[])} lots - The single lot or array of lots to deposit into the account.
   */
  deposit(lots) {

    if (Array.isArray(lots)) {

      this.lots = this.lots.concat(lots);

    }
    else {

      this.lots.push(lots);

    }
  }

  /**
   * Withdraws an amount of cryptocurrency from the account.
   * If necessary the last lot to be withdrawn is split.
   * The fee is assigned to the withdrawn lots in proportion to their size.
   * Throws an error if the amount requested is greater than the balance in the account.
   * @param {number} amount - The amount of cryptocurrency to withdraw.
   * @param {number} fee - The fee which is also withdrawn from the account.
   * @param {string} lotMatching - The lot matching method used to determine the order in which lots are withdrawn.
   * FIFO First in first out.
   * LIFO Last in first out.
   * HIFO Highest cost first out.
   * LOFO Lowest cost first out.
   * @return {Lot[]} The collection if lots withdrawn.
   */
  withdraw(amount, fee, lotMatching, row) {

    let amountSatoshi = Math.round(amount * 1e8);
    let feeSatoshi = Math.round(fee * 1e8);
    let neededSatoshi = amountSatoshi + feeSatoshi;

    if (neededSatoshi > this.satoshi) {

      throw new CryptoAccountError(`Attempted to withdraw ${this.crypto} ${amount} + fee ${fee} from balance of ${this.crypto} ${this.balance}`, row);

    }

    this.lots.sort(this.lotComparator(lotMatching));

    let keepLots = [];
    let withdrawLots = [];
    for (let lot of this.lots) {

      if (neededSatoshi > 0) {  //need more

        if (lot.satoshi <= neededSatoshi) { //want full lot
          withdrawLots.push(lot);
          neededSatoshi -= lot.satoshi;
        }
        else {  //need to split lot
          let splitLots = lot.split(neededSatoshi);
          withdrawLots.push(splitLots[0]);
          keepLots.push(splitLots[1]);
          neededSatoshi = 0;
        }

      }
      else {  //keep the remaining lots

        keepLots.push(lot);

      }
    }

    //apportion the fee to withdrawal lots
    let totalSatoshi = amountSatoshi + feeSatoshi;
    let remainingFeeSatoshi = feeSatoshi;

    // loop through all except the last lot
    for (let i = 0; i < withdrawLots.length - 1; i++) {

      let lot = withdrawLots[i];
      let apportionedFeeSatoshi = Math.round((lot.satoshi / totalSatoshi) * feeSatoshi);
      lot.creditFeeSatoshi += apportionedFeeSatoshi;
      remainingFeeSatoshi -= apportionedFeeSatoshi;

    }
    //just add the remaining fee to the last lot to correct for any accumulated rounding errors
    withdrawLots[withdrawLots.length - 1].creditFeeSatoshi += remainingFeeSatoshi;

    this.lots = keepLots;
    return withdrawLots;
  }

  /**
   * Given a lot matching method string returns a comparator function used to sort lots.
   * @param {string} lotMatching - The lot matching method used to determine the order in which lots are withdrawn.
   * FIFO First in first out.
   * LIFO Last in first out.
   * HIFO Highest cost first out.
   * LOFO Lowest cost first out.
   * Throw an error with any other input.
   * @return {function} The comparator function used to sort lots.
   */
  lotComparator(lotMatching) {

    if (lotMatching === 'FIFO') {

      return function (lot1, lot2) {
        return lot1.date - lot2.date;
      };
    }
    else if (lotMatching === 'LIFO') {

      return function (lot1, lot2) {
        return lot2.date - lot1.date;
      };
    }
    else if (lotMatching === 'LOFO') {

      return function (lot1, lot2) {
        return (lot1.costBasisCents / lot1.satoshi) - (lot2.costBasisCents / lot2.satoshi);
      };
    }
    else if (lotMatching === 'HIFO') {

      return function (lot1, lot2) {
        return (lot2.costBasisCents / lot2.satoshi) - (lot1.costBasisCents / lot1.satoshi);
      };
    }
    else {
      throw Error(`Lot Matching Method (${lotMatching}) not recognized.`);
    }
  }
}