CryptoTracker.prototype.deleteSheet = function (sheetName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    ss.deleteSheet(sheet);

  }
}

CryptoTracker.prototype.deleteSheets = function (sheetNames) {

  for (sheetName of sheetNames) {

    if (sheetName) {

      this.deleteSheet(sheetName);

    }
  }
}

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
}

CryptoTracker.prototype.sortTable = function (table, index) {

  table.sort(function (a, b) {
    return a[index] - b[index];
  });

  return table;
}

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

CryptoTracker.prototype.trimSheet = function (sheet, neededRows, neededColumns) {

  this.trimRows(sheet, neededRows);

  this.trimColumns(sheet, neededColumns);

}

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

CryptoTracker.prototype.addCurrencyValidation = function (sheet, a1Notation, values) {

  this.addValidation(sheet, a1Notation, values, 'New currencies will be added to the data validation dropdown when write reports is run.');

}

CryptoTracker.prototype.addWalletValidation = function (sheet, a1Notation, values) {

  this.addValidation(sheet, a1Notation, values, 'New wallets will be added to the data validation dropdown when write reports is run.');

}

CryptoTracker.prototype.addValidation = function (sheet, a1Notation, values, helpText) {

  let range = sheet.getRange(a1Notation);

  let rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values)
    .setHelpText(helpText)
    .build();

  range.setDataValidation(rule);

}


