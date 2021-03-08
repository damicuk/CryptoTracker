class ClosedLot {

  constructor(lot, date, creditCurrency, creditExRate, creditAmount, creditFee, walletName) {

    this.lot = lot;
    this.date = date;
    this.creditCurrency = creditCurrency;
    this.creditExRate = creditExRate;
    this.creditAmountSatoshi = Math.round(creditAmount * 1e8);
    this.creditFeeSatoshi = Math.round(creditFee * 1e8);
    this.walletName = walletName;

  }
}
