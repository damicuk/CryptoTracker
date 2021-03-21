/**
 * Represents a row in the ledger sheet
 * @class
 */
class LedgerRecord {

  /**
   * @constructor Assigns each column value to a property
   * @param {date} date - the date the action occurred
   * @param {string} action - Donation, Gift, Income, Payment, Stop, Trade, Transfer
   * @param {string} debitCurrency - The ticker of the fiat or cryptocurrency debited from the account
   * @param {number} debitExRate - The debit currency to accounting currency exchange rate, 0 if the debit currency is the accounting currency
   * @param {number} debitAmount - The amount of fiat or cryptocurrency debited from the account
   * @param {number} debitFee - The fee in the fiat or cryptocurrency debited from the account
   * @param {string} debitWalletName - The name of the wallet (or exchange) from which the fiat or cryptocurrency is debited
   * @param {string} creditCurrency - The ticker of the fiat or cryptocurrency credited to the account
   * @param {number} creditExRate - The credit currency to accounting currency exchange rate, 0 if the credit currency is the accounting currency
   * @param {number} creditAmount - The amount of fiat or cryptocurrency credited to the account
   * @param {number} creditFee - The fee in the fiat or cryptocurrency credited to the account
   * @param {string} creditWalletName - The name of the wallet (or exchange) to which the fiat or cryptocurrency is credited
   * @param {string} lotMatching - Sets the lot matching method to use from this point onwards - FIFO, LIFO, HIFO, LOFO
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
   * @static
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
