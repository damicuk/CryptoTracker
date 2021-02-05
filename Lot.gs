class Lot {

  constructor(date, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee) {

    this.date = date;
    this.debitCurrency = debitCurrency;
    this.debitExRate = debitExRate;
    this.debitAmountSatoshi = Math.round(debitAmount * 10e8);
    this.debitFeeSatoshi = Math.round(debitFee * 10e8);
    this.creditCurrency = creditCurrency;
    this.creditAmountSatoshi = Math.round(creditAmount * 10e8);
    this.creditFeeSatoshi = Math.round(creditFee * 10e8);

  }

  get satoshi() {

    return this.creditAmountSatoshi - this.creditFeeSatoshi;

  }

  get costBasisCents() {
    
    return Math.round(((this.debitAmountSatoshi - this.debitFeeSatoshi) * this.debitExRate) / 10e6);

  }

  split(amount) {


  }


}
