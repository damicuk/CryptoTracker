class CryptoAccount {

  constructor(ticker) {

    this.ticker = ticker;
    this.lots = new Array();

  }

  deposit(lot) {

    this.lots.push(lot);

  }

  get balance() {

    let satoshi = 0
    for (let lot of this.lots) {

      satoshi += lot.satoshi; //adding two integers - no need to round

    }
    return satoshi / 10e8;
  }

}