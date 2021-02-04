class LedgerRecord {

  constructor(date, action, debitCurrency, debitExRate, debitAmount, debitFee, creditCurrency, creditExRate, creditAmount, creditFee, exchangeName, walletName) {

    this.date = new Date(date);
    this.action = action;
    this.debitCurrency = debitCurrency;
    this.debitExRate = Number(debitExRate);
    this.debitAmount = Number(debitAmount);
    this.debitFee = Number(debitFee);
    this.creditCurrency = creditCurrency;
    this.creditExRate = Number(creditExRate);
    this.creditAmount = Number(creditAmount);
    this.creditFee = Number(creditFee);
    this.exchangeName = exchangeName;
    this.walletName = walletName;
  }

}
