class ClosedLot {

  constructor(lot, date, walletName, creditCurrency, creditExRate, creditAmount, creditFee) {

    this.lot = lot;
    this.date = date;
    this.walletName = walletName;
    this.creditCurrency = creditCurrency;
    this.creditExRate = creditExRate;
    this.creditAmountSatoshi = Math.round(creditAmount * 1e8);
    this.creditFeeSatoshi = Math.round(creditFee * 1e8);

  }

  // get crypto() {

  //   return this.lot.creditCurrency;

  // }

  // get satoshi() {

  //   return this.lot.satoshi;

  // }

  // get costBasisCents() {

  //   return this.lot.costBasisCents;

  // }

  get creditSatoshi() {

    return this.creditAmountSatoshi - this.creditFeeSatoshi;

  }

  get proceedsCents() {

    let exRate = 1;
    if (this.creditExRate) {

      exRate = this.creditExRate;

    }

    return Math.round((this.creditSatoshi * exRate) / 1e6);

  }
}
