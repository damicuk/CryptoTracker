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

  }

  get satoshi() {

    return Math.round(creditAmount * 10e8) - Math.round(creditFee * 10e8); //round because multiplying

  }

  get costBasisCents() {

    let costBasisDebitCurrency = Math.round(debitCurrency * 100) - Math.round(debitFee * 100);
    return Math.round(costBasisDebitCurrency * debitExRate);

  }

  split(amount) {


  }


}
