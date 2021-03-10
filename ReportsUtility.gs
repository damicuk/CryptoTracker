function getSheet(sheetName) {

  ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  return sheet;
}

function addLongShortCondition(sheet, a1Notation) {

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

function tidySheet(sheet, dataColumns) {

  const totalColumns = sheet.getMaxColumns();
  const extraColumns = totalColumns - dataColumns;

  if (extraColumns > 0) {
    sheet.deleteColumns(dataColumns + 1, extraColumns);
  }

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, dataColumns);

}
