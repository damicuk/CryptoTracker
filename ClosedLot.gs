class ClosedLot {

  constructor(lot, date, creditWalletName, creditCurrency, creditExRate, creditAmount, creditFee) {

    this.lot = lot;
    this.date = date;
    this.creditWalletName = creditWalletName;
    this.creditCurrency = creditCurrency;
    this.creditExRate = creditExRate;
    this.creditAmountSatoshi = Math.round(creditAmount * 10e8);
    this.creditFeeSatoshi = Math.round(creditFee * 10e8);

  }

  get satoshi() {

    return this.creditAmountSatoshi - this.creditFeeSatoshi;

  }

  get proceedsCents() {
    
    return Math.round(((this.creditAmountSatoshi - this.creditFeeSatoshi) * this.creditExRate) / 10e6);

  }

}
