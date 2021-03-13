CryptoTracker.prototype.getSheet = function (sheetName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  return sheet;
}

CryptoTracker.prototype.deleteSheet = function (sheetName) {

  let ss = SpreadsheetApp.getActive();

  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    ss.deleteSheet(sheet);

  }
}

CryptoTracker.prototype.trimSheet = function (sheet, neededRows, neededColumns) {

  if (neededRows) {

    const totalRows = sheet.getMaxRows();

    const extraRows = totalRows - neededRows;

    if (extraRows > 0) {
      sheet.deleteRows(neededRows + 1, extraRows);
    }
    else if (extraRows < 0) {
      sheet.insertRowsAfter(totalRows, -extraRows);
    }
  }

  if (neededColumns) {

    const totalColumns = sheet.getMaxColumns();

    const extraColumns = totalColumns - neededColumns;

    if (extraColumns > 0) {
      sheet.deleteColumns(neededColumns + 1, extraColumns);
    }
    else if (extraColumns < 0) {
      sheet.insertColumnsAfter(totalColumns, -extraColumns);
    }
  }
}

CryptoTracker.prototype.trimColumns = function (sheet, neededColumns) {

  this.trimSheet(sheet, undefined, neededColumns);

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

CryptoTracker.prototype.addEmptyCondtion = function (sheet, range) {

  let rule = SpreadsheetApp.newConditionalFormatRule()
    .whenCellEmpty()
    .setBackground('#efefef')
    .setRanges([range])
    .build();

  let rules = sheet.getConditionalFormatRules();
  rules.push(rule);
  sheet.setConditionalFormatRules(rules);

}



