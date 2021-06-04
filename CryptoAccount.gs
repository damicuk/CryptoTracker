/**
 * Cryptocurrency account.
 * Calculation are done in integer amounts of subunits to avoid computational rounding errors.
 */
var CryptoAccount = class CryptoAccount {

  /**
   * Sets the cryptocurrency currency and initializes an empty array to contain the crytocurrency lots.
   * @param {string} ticker - the cryptocurrency currency ticker.
   */
  constructor(ticker) {

    /**
     * The cryptocurrency currency ticker.
     * @type {string}
     */
    this.ticker = ticker;

    /**
     * The crytocurrency lots.
     * @type {Array<Lot>}
     */
    this.lots = [];

  }

  get ticker() {

    return this._ticker;
  }

  set ticker(ticker) {

    this._ticker = ticker;
    this._currencySubunits = Currency.subunits(ticker);
  }

  /**
   * The balance in the account in subunits.
   * @type {number}
   */
  get subunits() {

    let subunits = 0;
    for (let lot of this.lots) {

      subunits += lot.subunits; //adding two integers - no need to round

    }
    return subunits;
  }

  /**
   * The balance in the account.
   * @type {number}
   */
  get balance() {

    return this.subunits / this._currencySubunits;
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
   * @param {number} rowIndex - The index of the row in the ledger sheet used to set the current cell in case of an error.
   * @return {Lot[]} The collection of lots withdrawn.
   */
  withdraw(amount, fee, lotMatching, rowIndex) {

    let amountSubunits = Math.round(amount * this._currencySubunits);
    let feeSubunits = Math.round(fee * this._currencySubunits);
    let neededSubunits = amountSubunits + feeSubunits;

    if (neededSubunits > this.subunits) {

      throw new CryptoAccountError(`Attempted to withdraw ${this.ticker} ${amount} + fee ${fee} from balance of ${this.ticker} ${this.balance}`, rowIndex);

    }

    this.lots.sort(this.lotComparator(lotMatching));

    let keepLots = [];
    let withdrawLots = [];
    for (let lot of this.lots) {

      if (neededSubunits > 0) {  //need more

        if (lot.subunits <= neededSubunits) { //want full lot
          withdrawLots.push(lot);
          neededSubunits -= lot.subunits;
        }
        else {  //need to split lot
          let splitLots = lot.split(neededSubunits);
          withdrawLots.push(splitLots[0]);
          keepLots.push(splitLots[1]);
          neededSubunits = 0;
        }

      }
      else {  //keep the remaining lots

        keepLots.push(lot);

      }
    }

    //apportion the fee to withdrawal lots
    this.apportionFeeSubunits(feeSubunits, withdrawLots);

    this.lots = keepLots;
    return withdrawLots;
  }

  /**
   * Apportions fee subunits equitably between lots.
   * The fee subunits are assigned to the lots in proportion to the lot subunits.
   * Throws an error if the fee subunits are greater than the lots subunits.
   * @param {number} fee subunit - The fee subunits to assign to the lots.
   * @param {Lot[]} lots - The collection of lots.
   */
  apportionFeeSubunits(feeSubunits, lots) {

    let lotSubunits = [];
    for (let lot of lots) {
      lotSubunits.push(lot.subunits);
    }
    let apportionedFeeSubunits = CryptoTracker.apportionInteger(feeSubunits, lotSubunits);
    let index = 0;
    for (let lot of lots) {
      lot.creditFeeSubunits += apportionedFeeSubunits[index++];
    }
  }

  /**
   * Apportions fee equitably between the lots of the account.
   * The fee is assigned to the lots in proportion to the lot size.
   * Throws an error if the fee is greater than the balance in the account.
   * @param {number} fee - The fee to assign to the lots of this account.
   * @param {number} rowIndex - The index of the row in the ledger sheet used to set the current cell in case of an error.
   */
  apportionFee(fee, rowIndex) {

    let feeSubunits = Math.round(fee * this._currencySubunits);

    if (feeSubunits > this.subunits) {

      throw new CryptoAccountError(`Attempted to withdraw fee ${fee} from balance of ${this.ticker} ${this.balance}`, rowIndex);

    }

    this.apportionFeeSubunits(feeSubunits, this.lots);
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
        return (lot1.costBasisSubunits / lot1.subunits) - (lot2.costBasisSubunits / lot2.subunits);
      };
    }
    else if (lotMatching === 'HIFO') {

      return function (lot1, lot2) {
        return (lot2.costBasisSubunits / lot2.subunits) - (lot1.costBasisSubunits / lot1.subunits);
      };
    }
    else {
      throw Error(`Lot Matching Method (${lotMatching}) not recognized.`);
    }
  }
};