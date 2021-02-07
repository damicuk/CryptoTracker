class ClosedLot {

  constructor(lot, date, creditCurrency, creditExRate, creditAmount, creditFee) {

    this.lot = lot;
    this.date = date;
    this.creditCurrency = creditCurrency;
    this.creditExRate = creditExRate;
    this.creditAmountSatoshi = Math.round(creditAmount * 10e8);
    this.creditFeeSatoshi = Math.round(creditFee * 10e8);

  }

}
