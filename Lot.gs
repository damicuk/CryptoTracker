class Lot {

  constructor(date, debitWalletName, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditAmount, creditFee) {

    this.date = date;
    this.debitWalletName = debitWalletName;
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
    if(this.debitExRate) {

        exRate = this.debitExRate;

    }

    return Math.round(((this.debitAmountSatoshi - this.debitFeeSatoshi) * exRate) / 1e6);

  }

  split(satoshi) {

    let splitLots = new Array();
    
    let debitAmountSatoshi = Math.round((satoshi / this.satoshi) * this.debitAmountSatoshi);
    let debitFeeSatoshi = Math.round((satoshi / this.satoshi) * this.debitFeeSatoshi);
    let creditFeeSatoshi = Math.round((satoshi / this.satoshi) * this.creditFeeSatoshi);
    let creditAmountSatoshi = satoshi + creditFeeSatoshi;

    let lot1 = new Lot(this.date,
                        this.debitWalletName,
                        this.debitCurrency,
                        this.debitExRate,
                        debitAmountSatoshi / 1e8,
                        debitFeeSatoshi / 1e8,
                        this.creditCurrency,
                        creditAmountSatoshi / 1e8,
                        creditFeeSatoshi / 1e8);
    
    splitLots.push(lot1);
    
    let lot2 = new Lot(this.date,
                      this.debitWalletName,
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

function testSplitLots() {

  let lot = new Lot(new Date(Date.now()), 'Kraken', 'USD', 0, 105, 8, 'ADA', 110.678, 0.6);

  let splitLots = lot.split(35.97 * 1e8);
  let lot1 = splitLots[0];
  let lot2 = splitLots[1];

  Logger.log(`[${lot1.date.toISOString()}] ${lot1.debitWalletName} ${lot1.satoshi} ${lot1.debitCurrency} ${lot1.debitExRate} ${lot1.debitAmountSatoshi} ${lot1.debitFeeSatoshi} ${lot1.creditCurrency}  ${lot1.creditAmountSatoshi} ${lot1.creditFeeSatoshi}`);
  Logger.log(`[${lot2.date.toISOString()}] ${lot2.debitWalletName} ${lot2.satoshi} ${lot2.debitCurrency} ${lot2.debitExRate} ${lot2.debitAmountSatoshi} ${lot2.debitFeeSatoshi} ${lot2.creditCurrency}  ${lot2.creditAmountSatoshi} ${lot2.creditFeeSatoshi}`);

}
