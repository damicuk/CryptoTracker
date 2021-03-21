/**
 * Represents a row in the ledger sheet
 * @class
 */
class LedgerRecord {

  /**
   * @constructor Assigns each column value to a property 
   */
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

  /**
   * Returns the index of the column given its assigned name
   * Avoids hard coding column numbers
   * @param {string} columnName - the name assigned to the column in the ledger sheet
   * @return {number} The index of the named column or -1 if column name not found
   */
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

/**
 * Retrieves the ledger records from the ledger sheet and sorts them by date
 * Stops reading if it encounters the stop action
 * @return {LedgerRecord[]} The collection of ledger records
 */
CryptoTracker.prototype.getLedgerRecords = function () {

  let ledgerRange = this.getLedgerRange();
  let ledgerData = ledgerRange.getValues();

  //convert raw data to object array
  let ledgerRecords = [];
  for (let row of ledgerData) {

    let ledgerRecord = new LedgerRecord(
      row[0],
      row[1],
      row[2],
      row[3],
      row[4],
      row[5],
      row[6],
      row[7],
      row[8],
      row[9],
      row[10],
      row[11],
      row[12]
    );

    //Stop reading here
    if (ledgerRecord.action === 'Stop') {

      break;

    }

    ledgerRecords.push(ledgerRecord);

  }

  ledgerRecords.sort(function (a, b) {
    return a.date - b.date;
  });

  return ledgerRecords;
}
