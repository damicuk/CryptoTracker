class LedgerRecord {

  constructor(
    date,
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
    lotMatching) {

    this.date = new Date(date);
    this.action = action;
    this.debitCurrency = debitCurrency;
    this.debitExRate = debitExRate;
    this.debitAmount = debitAmount;
    this.debitFee = debitFee;
    this.debitWalletName = debitWalletName;
    this.creditCurrency = creditCurrency;
    this.creditExRate = creditExRate;
    this.creditAmount = creditAmount;
    this.creditFee = creditFee;
    this.creditWalletName = creditWalletName;
    this.lotMatching = lotMatching;

  } 

  static getColumnIndex(columnName) {

    let columns = [
      'date',
      'action',
      'debitCurrency',
      'debitExRate',
      'debitAmount',
      'debitFee',
      'debitWalletName',
      'creditCurrency',
      'creditExRate',
      'creditAmount',
      'creditFee',
      'creditWalletName',
      'lotMatching'
    ];

    let index = columns.indexOf(columnName);
    
    return index === -1 ? index : index + 1;
  }
}
