class ClosedLot {

  constructor(lot, debitFee, date, walletName, creditCurrency, creditExRate, creditAmount, creditFee) {

    this.lot = lot;
    this.debitFeeSatoshi = Math.round(debitFee * 1e8);
    this.date = date;
    this.walletName = walletName;
    this.creditCurrency = creditCurrency;
    this.creditExRate = creditExRate;
    this.creditAmountSatoshi = Math.round(creditAmount * 1e8);
    this.creditFeeSatoshi = Math.round(creditFee * 1e8);

  }

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
