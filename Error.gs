
/**
 * Central error handling displays alert and sets the currenct cell when appropriate
 * @param {string} error - The type of error
 * @param {string} message - The message to display to the user
 * @param {number} [rowIndex] - The row index of the cell in the ledger sheet
 * @param {string} [columnName] - the name assigned to the column in the ledger sheet
 * Used to get the index from LedgerRecord.getColumnIndex(columnName)
 * Avoids hard coding column numbers
 */
CryptoTracker.prototype.handleError = function (error, message, rowIndex, columnName) {

  if (error === 'validation') {

    this.setCurrentCell(rowIndex, columnName);

    SpreadsheetApp.getUi().alert(`Ledger validation failed`, message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
  else if (error === 'cryptoAccount') {

    this.setCurrentCell(rowIndex, columnName);

    SpreadsheetApp.getUi().alert(`Insufficient funds`, message, SpreadsheetApp.getUi().ButtonSet.OK);

  }
  else if (error === 'api') {

    SpreadsheetApp.getUi().alert(`Error updating crypto prices`, message, SpreadsheetApp.getUi().ButtonSet.OK);

  }
  else if (error === 'settings') {

    SpreadsheetApp.getUi().alert(`Failed to save settings`, message, SpreadsheetApp.getUi().ButtonSet.OK);

  }
};

/**
 * Sets the currenct cell i the ledger sheet
 * @param {number} rowIndex - The row index of the cell in the ledger sheet
 * @param {string} columnName - the name assigned to the column in the ledger sheet
 * Used to get the index from LedgerRecord.getColumnIndex(columnName)
 * Avoids hard coding column numbers
 */
CryptoTracker.prototype.setCurrentCell = function (rowIndex, columnName) {

  let ss = SpreadsheetApp.getActive();
  let ledgerSheet = ss.getSheetByName(this.ledgerSheetName);

  if (ledgerSheet) {

    let columnIndex = LedgerRecord.getColumnIndex(columnName);
    let range = ledgerSheet.getRange(rowIndex, columnIndex, 1, 1);
    ss.setCurrentCell(range);
    SpreadsheetApp.flush();

  }
};

/**
 * General custom error from which to inherit
 * Assigns the name of the class to the name property and passes the message to super
 * @class
 */
class CustomError extends Error {

  /**
   * @constructor
   * @param {string} message - description of the error and suggested solution
   */
  constructor(message) {

    super(message);

    this.name = this.constructor.name;
  }
}

/**
 * Error in the validation of the ledger
 * @class
 */
class ValidationError extends CustomError {

  /**
   * @constructor
   * @param {string} message - description of the error and suggested solution
   * @param {number} rowIndex - the row numer in the ledger sheet that requires atention
   * @param {string} columnName - the name assigned to the column in the ledger sheet
   * Used to get the index from LedgerRecord.getColumnIndex(columnName)
   * Avoids hard coding column numbers
   */
  constructor(message, rowIndex, columnName) {

    super(message);

    this.rowIndex = rowIndex;
    this.columnName = columnName;

  }
}

/**
 * Error when attempting to withdraw from a cryptocurrency account
 * @class
 */
class CryptoAccountError extends CustomError {

  /**
   * @constructor
   * @param {string} message - description of the error and suggested solution
   * @param {number} rowIndex - the row numer in the ledger sheet that requires atention
   */
  constructor(message, rowIndex) {

    super(message);

    this.rowIndex = rowIndex;
  }
}

/**
 * Error when attempting to retrieve crypto prices from an API
 * @class
 */
class ApiError extends CustomError {

  /**
   * @constructor
   * @param {string} message - description of the error and suggested solution
   */
  constructor(message) {

    super(message);

  }
}