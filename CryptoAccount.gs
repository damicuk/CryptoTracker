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

    for (let lot of lots) {

      this.lots.push(lot);
    }
  }

  withdraw(amount, fee, lotMatching) {

    let amountSatoshi = Math.round(amount * 1e8);
    let feeSatoshi = Math.round(fee * 1e8);
    let neededSatoshi = amountSatoshi + feeSatoshi;

    if (neededSatoshi > this.satoshi) {
      throw Error(`Crypto account withdraw ${this.currency} ${amount} + fee ${fee}, insufficient funds ${this.currency}  ${this.balance}`);
    }

    this.lots.sort(this.lotComparator(lotMatching));

    let keepLots = new Array();
    let withdrawLots = new Array();
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