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

  split(satoshi) {

    let splitLots = new Array();
    
    //let satoshi = Math.round(amount * 10e8);
    let debitAmountSatoshi = Math.round((satoshi / this.satoshi) * this.debitAmountSatoshi);
    let debitFeeSatoshi = Math.round((satoshi / this.satoshi) * this.debitFeeSatoshi);
    let creditFeeSatoshi = Math.round((satoshi / this.satoshi) * this.creditFeeSatoshi);
    let creditAmountSatoshi = satoshi + creditFeeSatoshi;

    let lot1 = new Lot(this.date,
                        this.debitCurrency,
                        this.debitExRate,
                        debitAmountSatoshi / 10e8,
                        debitFeeSatoshi / 10e8,
                        this.creditCurrency,
                        creditAmountSatoshi / 10e8,
                        creditFeeSatoshi / 10e8);
    
    splitLots.push(lot1);
    
    let lot2 = new Lot(this.date,
                      this.debitCurrency,
                      this.debitExRate,
                      (this.debitAmountSatoshi - lot1.debitAmountSatoshi) / 10e8,
                      (this.debitFeeSatoshi - lot1.debitFeeSatoshi) / 10e8,
                      this.creditCurrency,
                      (this.creditAmountSatoshi - lot1.creditAmountSatoshi) / 10e8,
                      (this.creditFeeSatoshi - lot1.creditFeeSatoshi) / 10e8);
    
    splitLots.push(lot2);

    return splitLots;

  }
}

function testSplitLots() {

  let lot = new Lot(new Date(Date.now()), 'USD', 0, 105, 8, 'ADA', 110.678, 0.6);

  let splitLots = lot.split(35.97 * 10e8);
  let lot1 = splitLots[0];
  let lot2 = splitLots[1];

  Logger.log(`[${lot1.date.toISOString()}] ${lot1.satoshi} ${lot1.debitCurrency} ${lot1.debitExRate} ${lot1.debitAmountSatoshi} ${lot1.debitFeeSatoshi} ${lot1.creditCurrency}  ${lot1.creditAmountSatoshi} ${lot1.creditFeeSatoshi}`);
  Logger.log(`[${lot2.date.toISOString()}] ${lot2.satoshi} ${lot2.debitCurrency} ${lot2.debitExRate} ${lot2.debitAmountSatoshi} ${lot2.debitFeeSatoshi} ${lot2.creditCurrency}  ${lot2.creditAmountSatoshi} ${lot2.creditFeeSatoshi}`);

}
