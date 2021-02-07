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

    return this.satoshi / 10e8;
  }

  deposit(lots) {

    for (let lot of lots) {

      this.lots.push(lot);

    }
  }

  withdraw(amount, fee) {

    let amountSatoshi = Math.round(amount * 10e8);
    let feeSatoshi = Math.round(fee * 10e8);
    let neededSatoshi = amountSatoshi + feeSatoshi;

    if (neededSatoshi > this.satoshi) {
      throw Error(`Crypto account withdraw ${this.currency} ${amount} + fee ${fee}, insufficient funds ${this.currency}  ${this.balance}`);
    }

    //sort by date
    this.lots.sort(function (a, b) {
      return a.date - b.date;
    });

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
      let apportionedFee = Math.round((lot.satoshi / totalSatoshi) * feeSatoshi);
      lot.creditFeeSatoshi += apportionedFee;
      remainingFeeSatoshi -= apportionedFee;

    }
    //just add the remaining fee to the last lot to correct for any accumulated rounding errors
    withdrawLots[withdrawLots.length - 1].creditFeeSatoshi += remainingFeeSatoshi;

    this.lots = keepLots;
    return withdrawLots;
  }
}