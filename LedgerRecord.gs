class LedgerRecord {

  constructor(date,
              action,
              debitCurrency,
              debitExRate,
              debitAmount,
              debitFee,
              debitWalletName,
              creditCurrency,
              creditExRate,
              creditAmount,
              creditFee,
              creditWalletName,
              lotMatching,
              hasDebitExRate,
              hasDebitAmount,
              hasDebitFee,
              hasCreditExRate,
              hasCreditAmount,
              hasCreditFee) {

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
    this.lotMatching = lotMatching;

    //were these fields blank? (to distinguish from zero)
    this.hasDebitExRate = hasDebitExRate;
    this.hasDebitAmount = hasDebitAmount;
    this.hasDebitFee = hasDebitFee;
    this.hasCreditExRate = hasCreditExRate;
    this.hasCreditAmount = hasCreditAmount;
    this.hasCreditFee = hasCreditFee;

  }

}
