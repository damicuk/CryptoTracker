class Lot {

  constructor(date, walletName, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee) {

    this.date = date;
    this.walletName = walletName;
    this.debitCurrency = debitCurrency;
    this.debitExRate = debitExRate;
    this.debitAmountSatoshi = Math.round(debitAmount * 1e8);
    this.debitFeeSatoshi = Math.round(debitFee * 1e8);
    this.creditCurrency = creditCurrency;
    this.creditAmountSatoshi = Math.round(creditAmount * 1e8);
    this.creditFeeSatoshi = Math.round(creditFee * 1e8);

  }

  get satoshi() {

    return this.creditAmountSatoshi - this.creditFeeSatoshi;
  }

  get costBasisCents() {

    let exRate = 1;
    if (this.debitExRate) {

      exRate = this.debitExRate;

    }

    return Math.round(((this.debitAmountSatoshi + this.debitFeeSatoshi) * exRate) / 1e6);
  }

  split(satoshi) {

    let splitLots = new Array();

    let debitAmountSatoshi = Math.round((satoshi / this.satoshi) * this.debitAmountSatoshi);
    let debitFeeSatoshi = Math.round((satoshi / this.satoshi) * this.debitFeeSatoshi);
    let creditFeeSatoshi = Math.round((satoshi / this.satoshi) * this.creditFeeSatoshi);
    let creditAmountSatoshi = satoshi + creditFeeSatoshi;

    let lot1 = new Lot(this.date,
      this.walletName,
      this.debitCurrency,
      this.debitExRate,
      debitAmountSatoshi / 1e8,
      debitFeeSatoshi / 1e8,
      this.creditCurrency,
      creditAmountSatoshi / 1e8,
      creditFeeSatoshi / 1e8);

    splitLots.push(lot1);

    let lot2 = new Lot(this.date,
      this.walletName,
      this.debitCurrency,
      this.debitExRate,
      (this.debitAmountSatoshi - lot1.debitAmountSatoshi) / 1e8,
      (this.debitFeeSatoshi - lot1.debitFeeSatoshi) / 1e8,
      this.creditCurrency,
      (this.creditAmountSatoshi - lot1.creditAmountSatoshi) / 1e8,
      (this.creditFeeSatoshi - lot1.creditFeeSatoshi) / 1e8);

    splitLots.push(lot2);

    return splitLots;

  }
}