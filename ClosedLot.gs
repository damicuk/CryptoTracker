class ClosedLot {

  constructor(lot, date, creditWalletName, creditCurrency, creditExRate, creditAmount, creditFee) {

    this.lot = lot;
    this.date = date;
    this.creditWalletName = creditWalletName;
    this.creditCurrency = creditCurrency;
    this.creditExRate = creditExRate;
    this.creditAmountSatoshi = Math.round(creditAmount * 1e8);
    this.creditFeeSatoshi = Math.round(creditFee * 1e8);

  }
  
  get satoshi() {

    return this.creditAmountSatoshi - this.creditFeeSatoshi;

  }

  get proceedsCents() {
    
    let exRate = 1;
    if(this.creditExRate) {

        exRate = this.creditExRate;

    }

    return Math.round(((this.creditAmountSatoshi - this.creditFeeSatoshi) * exRate) / 1e6);

  }

}
