class ReportHelper {

  constructor() { }

  static getSheet(sheetName) {

    let ss = SpreadsheetApp.getActive();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    return sheet;
  }

  static addLongShortCondition(sheet, a1Notation) {

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

  static trimColumns(sheet, neededColumns) {

    const totalColumns = sheet.getMaxColumns();
    const extraColumns = totalColumns - neededColumns;

    if (extraColumns > 0) {
      sheet.deleteColumns(neededColumns + 1, extraColumns);
    }
    else if (extraColumns < 0) {
      sheet.insertColumnsAfter(totalColumns, -extraColumns);
    }

    SpreadsheetApp.flush();

  }
}