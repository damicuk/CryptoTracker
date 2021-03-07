class CryptoAccount {

  constructor(currency) {

    this.currency = currency;
    this.lots = new Array();

  }

  get satoshi() {

    let satoshi = 0
    for (let lot of this.lots) {

      satoshi += lot.satoshi; //adding two integers - no need to round

    }
    return satoshi;
  }

  get balance() {

    return this.satoshi / 1e8;
  }

  get costBasisCents() {

    let costBasisCents = 0;
    for (let lot of this.lots) {

      costBasisCents += lot.costBasisCents; //adding two integers - no need to round

    }
    return costBasisCents;
  }

  get costBasis() {

    return this.costBasisCents / 100
  }

  deposit(lots) {

    Array.isArray(lots) ?
      this.lots = this.lots.concat(lots) :
      this.lots.push(lots);
  
  }

  withdraw(amount, fee, lotMatching) {

    let amountSatoshi = Math.round(amount * 1e8);
    let feeSatoshi = Math.round(fee * 1e8);
    let neededSatoshi = amountSatoshi + feeSatoshi;

    if (neededSatoshi > this.satoshi) {
      throw Error(`Crypto account withdraw ${this.currency} ${amount} + fee ${fee}, insufficient funds ${this.currency}  ${this.balance}`);
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

    this.lots = keepLots;
    return withdrawLots;
  }

  lotComparator(lotMatching) {

    if (lotMatching == 'FIFO') {

      return function (lot1, lot2) {
        lot1.date - lot2.date;
      }
    }
    else if (lotMatching == 'LIFO') {

      return function (lot1, lot2) {
        return lot2.date - lot1.date;
      }
    }
    else if (lotMatching == 'LOFO') {

      return function (lot1, lot2) {
        return (lot1.costBasisCents / lot1.satoshi) - (lot2.costBasisCents / lot2.satoshi);
      }
    }
    else if (lotMatching == 'HIFO') {

      return function (lot1, lot2) {
        return (lot2.costBasisCents / lot2.satoshi) - (lot1.costBasisCents / lot1.satoshi);
      }
    }
    else {
      throw Error(`Lot Matching Method (${lotMatching}) not recognized.`);
    }
  }
}