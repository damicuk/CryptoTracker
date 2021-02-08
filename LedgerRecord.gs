class LedgerRecord {

  constructor(date, action, debitCurrency, debitExRate, debitAmount, debitFee, debitWalletName, creditCurrency, creditExRate, creditAmount, creditFee, creditWalletName) {

    this.date = new Date(date);
    this.action = action;
    this.debitCurrency = debitCurrency;
    this.debitExRate = Number(debitExRate);
    this.debitAmount = Number(debitAmount);
    this.debitFee = Number(debitFee);
    this.debitWalletName = debitWalletName;
    this.creditCurrency = creditCurrency;
    this.creditExRate = Number(creditExRate);
    this.creditAmount = Number(creditAmount);
    this.creditFee = Number(creditFee);
    this.creditWalletName = creditWalletName;

  }

}
