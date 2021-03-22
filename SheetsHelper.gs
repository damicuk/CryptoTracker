/**
 * Deletes the named sheet if it exists
 * Not intended for use by the end user
 * Useful in development and testing
 * @param {string} sheetName - The name of the sheet to delete
 */
CryptoTracker.prototype.deleteSheet = function (sheetName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    ss.deleteSheet(sheet);

  }
}

/**
 * Deletes any sheet that exists given an array of sheet names
 * Not intended for use by the end user
 * Useful in development and testing
 * @param {string[]} sheetNames - The names of the sheets to delete
 */
CryptoTracker.prototype.deleteSheets = function (sheetNames) {

  for (sheetName of sheetNames) {

    if (sheetName) {

      this.deleteSheet(sheetName);

    }
  }
}

/**
 * Writes a table of data values to a given sheet, trims the sheet to the correct size and resizes the columns
 * @param {Sheet} sheet - The sheet to wich the data values should be written
 * @param {*[][]]} dataTable - The table of values to write to the sheet
 * @param {number} headerRows - The number of header rows
 * @param {number} dataColumns - The number of data columns - needed as the table may be empty
 * @param {number} formulaColumns - The number of columns containing formulas to the right of the data
 */
CryptoTracker.prototype.writeTable = function (sheet, dataTable, headerRows, dataColumns, formulaColumns = 0) {

  const dataRows = dataTable.length;

  //keep at least header and one row for arrayformula references
  const neededRows = Math.max(headerRows + dataRows, headerRows + 1);

  const neededColumns = dataColumns + formulaColumns;

  this.trimSheet(sheet, neededRows, neededColumns);

  if (dataRows > 0) {

    let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, dataColumns);

    dataRange.setValues(dataTable);

  }
  else {

    let dataRange = sheet.getRange(headerRows + 1, 1, 1, dataColumns);

    dataRange.clearContent();

  }

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, sheet.getMaxColumns());

  SpreadsheetApp.flush();
}


/**
 * Sorts a table of values given a column index
 * The column is assumed to be numeric or date
 * @param {*[][]]} dataTable - The table of values to be sorted
 * @param {number} index - The index of the column by which to sort
 */
CryptoTracker.prototype.sortTable = function (dataTable, index) {

  dataTable.sort(function (a, b) {
    return a[index] - b[index];
  });

  return dataTable;
}

/**
 * Renames a sheet by adding a number to the end of its name
 * Searches for the first available number starting at 1
 * @param {string} sheetName - The name of the sheet to be renamed
 */
CryptoTracker.prototype.renameSheet = function (sheetName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    let i = 1;

    while (Boolean(ss.getSheetByName(`${sheetName} ${i}`))) {
      i++;
    }

    sheet.setName(`${sheetName} ${i}`);

  }
}

/**
 * Resizes a sheet by inserting or deleting rows and columns
 * @param {number} [neededRows] - The number of rows required
 * If not provided it resizes to the size of the data keeping at lease one non-frozen row
 * @param {number} [neededColumns] - The number of columns required
 * If not provided it resizes to the size of the data keeping at lease one non-frozen column
 */
CryptoTracker.prototype.trimSheet = function (sheet, neededRows, neededColumns) {

  this.trimRows(sheet, neededRows);

  this.trimColumns(sheet, neededColumns);

}

/**
 * Resizes a sheet by inserting or deleting rows
 * @param {number} [neededRows] - The number of rows required
 * If not provided it resizes to the size of the data keeping at lease one non-frozen row
 */
CryptoTracker.prototype.trimRows = function (sheet, neededRows) {

  if (!neededRows) {

    let dataRange = sheet.getDataRange();

    neededRows = Math.max(dataRange.getHeight(), sheet.getFrozenRows() + 1);

  }

  const totalRows = sheet.getMaxRows();

  const extraRows = totalRows - neededRows;

  if (extraRows > 0) {

    sheet.deleteRows(neededRows + 1, extraRows);

  }
  else if (extraRows < 0) {

    sheet.insertRowsAfter(totalRows, -extraRows);

  }
}

/**
 * Resizes a sheet by inserting or deleting columns
 * @param {number} [neededColumns] - The number of columns required
 * If not provided it resizes to the size of the data keeping at lease one non-frozen column
 */
CryptoTracker.prototype.trimColumns = function (sheet, neededColumns) {

  if (!neededColumns) {

    let dataRange = sheet.getDataRange();

    neededColumns = Math.max(dataRange.getWidth(), sheet.getFrozenColumns() + 1);

  }

  const totalColumns = sheet.getMaxColumns();

  const extraColumns = totalColumns - neededColumns;

  if (extraColumns > 0) {

    sheet.deleteColumns(neededColumns + 1, extraColumns);

  }
  else if (extraColumns < 0) {

    sheet.insertColumnsAfter(totalColumns, -extraColumns);

  }
}

/**
 * Adds specific conditional text color formatting to a range of cells in a sheet
 * Used to format the action column of the ledger sheet
 * @param {Sheet} sheet - The sheet containing the range of cells to format
 * @param {string} a1Notation - The A1 notation used to specify the range of cells to be formatted
 */
CryptoTracker.prototype.addActionCondtion = function (sheet, a1Notation) {

  let textColors = [
    ['Donation', '#ff9900'],
    ['Gift', '#ff9900'],
    ['Income', '#6aa84f'],
    ['Payment', '#1155cc'],
    ['Stop', '#9900ff'],
    ['Transfer', '#ff0000']
  ];

  let range = sheet.getRange(a1Notation);
  let rules = sheet.getConditionalFormatRules();

  for (let textColor of textColors) {

    let rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(textColor[0])
      .setFontColor(textColor[1])
      .setRanges([range])
      .build();

    rules.push(rule);
  }

  sheet.setConditionalFormatRules(rules);

}

/**
 * Adds specific conditional text color formatting to a range of cells in a sheet
 * Used to format the long / short columns in the reports sheets
 * @param {Sheet} sheet - The sheet containing the range of cells to format
 * @param {string} a1Notation - The A1 notation used to specify the range of cells to be formatted
 */
CryptoTracker.prototype.addLongShortCondition = function (sheet, a1Notation) {

  let range = sheet.getRange(a1Notation);

  let shortRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('SHORT')
    .setFontColor("#ff0000")
    .setRanges([range])
    .build();

  let longRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('LONG')
    .setFontColor("#0000ff")
    .setRanges([range])
    .build();

  let rules = sheet.getConditionalFormatRules();
  rules.push(shortRule);
  rules.push(longRule);
  sheet.setConditionalFormatRules(rules);

}

/**
 * Sets data validation from a list on a range of cells in a sheet
 * Sets the help text that appears when the user hovers over a cell on which data validation is set
 * Used specifically to set the data validation on the currency columns in the ledger sheet
 * @param {Sheet} sheet - The sheet containing the range of cells on which data validation is set
 * @param {string} a1Notation - The A1 notation used to specify the range of cells on which data validation is set
 * @param {string[]} values - The list of valid values
 */
CryptoTracker.prototype.addCurrencyValidation = function (sheet, a1Notation, values) {

  this.addValidation(sheet, a1Notation, values, 'New currencies will be added to the data validation dropdown when write reports is run.');

}

/**
 * Sets data validation from a list on a range of cells in a sheet
 * Sets the help text that appears when the user hovers over a cell on which data validation is set
 * Used specifically to set the data validation on the wallet columns in the ledger sheet
 * @param {Sheet} sheet - The sheet containing the range of cells on which data validation is set
 * @param {string} a1Notation - The A1 notation used to specify the range of cells on which data validation is set
 * @param {string[]} values - The list of valid values
 */
CryptoTracker.prototype.addWalletValidation = function (sheet, a1Notation, values) {

  this.addValidation(sheet, a1Notation, values, 'New wallets will be added to the data validation dropdown when write reports is run.');

}

/**
 * Sets data validation from a list on a range of cells in a sheet
 * @param {Sheet} sheet - The sheet containing the range of cells on which data validation is set
 * @param {string} a1Notation - The A1 notation used to specify the range of cells on which data validation is set
 * @param {string[]} values - The list of valid values
 * @param {string} helpText - Sets the help text that appears when the user hovers over a cell on which data validation is set
 */
CryptoTracker.prototype.addValidation = function (sheet, a1Notation, values, helpText) {

  let range = sheet.getRange(a1Notation);

  let rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values)
    .setHelpText(helpText)
    .build();

  range.setDataValidation(rule);

}


