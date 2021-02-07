class CryptoAccount {

  constructor(ticker) {

    this.ticker = ticker;
    this.lots = new Array();

  }

  deposit(lots) {

    for (let lot of lots) {

      this.lots.push(lot);
      
    }
  }

  withdraw(satoshi) {

    //sort by date
    lot.sort(function (a, b) {
      return a.date - b.date;
    });

    let neededSatoshi = satoshi;
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

    this.lots = keepLots;
    return withdrawLots;
  }

  get balance() {

    let satoshi = 0
    for (let lot of this.lots) {

      satoshi += lot.satoshi; //adding two integers - no need to round

    }
    return satoshi / 10e8;
  }

}