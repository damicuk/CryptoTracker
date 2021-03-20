CryptoTracker.prototype.handleError = function (error, message, rowIndex, columnName) {


  if (error === 'validation') {

    this.setCurrentCell(rowIndex, columnName);

    SpreadsheetApp.getUi().alert(`Ledger validation failed`, message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
  else if (error === 'api') {

    SpreadsheetApp.getUi().alert(`Failed to update crypto prices`, message, SpreadsheetApp.getUi().ButtonSet.OK);

  }
  else if (error === 'cryptoAccount') {

    this.setCurrentCell(rowIndex, columnName);

    SpreadsheetApp.getUi().alert(`Insufficient funds`, message, SpreadsheetApp.getUi().ButtonSet.OK);

  }
}

CryptoTracker.prototype.setCurrentCell = function (rowIndex, columnName) {

  let ss = SpreadsheetApp.getActive();
  let ledgerSheet = ss.getSheetByName(this.ledgerSheetName);

  if (ledgerSheet) {

    let columnIndex = LedgerRecord.getColumnIndex(columnName)
    let range = ledgerSheet.getRange(rowIndex, columnIndex, 1, 1);
    ss.setCurrentCell(range);
    SpreadsheetApp.flush();

  }
}

class CustomError extends Error {

  constructor(message) {

    super(message);

    this.name = this.constructor.name;
  }
}

class ValidationError extends CustomError {

  constructor(message, rowIndex, columnName) {

    super(message);

    this.rowIndex = rowIndex;
    this.columnName = columnName;

  }
}

class ApiError extends CustomError {

  constructor(message) {

    super(message);

  }
}

class CryptoAccountError extends CustomError {

  constructor(message, rowIndex) {

    super(message);

    this.rowIndex = rowIndex;
  }
}
