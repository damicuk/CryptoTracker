class Lot {

  constructor(date, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee) {

    this.date = date;
    this.debitCurrency = debitCurrency;
    this.debitExRate = debitExRate;
    this.debitAmount = debitAmount;
    this.debitFee = debitFee;
    this.creditCurrency = creditCurrency;
    this.creditAmount = creditAmount;
    this.creditFee = creditFee;
    this._satoshi = Math.round(creditAmount * 10e8) - Math.round(creditFee * 10e8); //round because multiplying
    this.costBasisCents = Math.round(debitCurrency * 100) - Math.round(debitFee * 100);

  }

  get satoshi() {

    return this._satoshi;

  }

  split(amount) {


  }
}
