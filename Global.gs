function processTrades() {

  let cryptoTracker = new CryptoTracker();

  cryptoTracker.processTrades();

  // let fiatTable = cryptoTracker.getFiatTable();

  // let cryptoTable = cryptoTracker.getCryptoTable();

  // let profitTable = cryptoTracker.getProfitTable();

  // let closedSummaryTable = cryptoTracker.getClosedSummaryTable();

  // let accountsSheet = getSheet('Accounts');

  // const rowOffset = 3
  // const colOffset = 2;

  // let fiatRange = accountsSheet.getRange(rowOffset, colOffset, fiatTable.length, fiatTable[0].length);
  // fiatRange.setValues(fiatTable);
  // formatTable(fiatRange);

  // let cryptoRange = accountsSheet.getRange(fiatRange.getLastRow() + rowOffset, colOffset, cryptoTable.length, cryptoTable[0].length);
  // cryptoRange.setValues(cryptoTable);
  // formatTable(cryptoRange);

  // let profitRange = accountsSheet.getRange(cryptoRange.getLastRow() + rowOffset, colOffset, profitTable.length, profitTable[0].length);
  // profitRange.setValues(profitTable);
  // formatTable(profitRange);

  // let closedSummaryRange = accountsSheet.getRange(profitRange.getLastRow() + rowOffset, colOffset, closedSummaryTable.length, closedSummaryTable[0].length);
  // closedSummaryRange.setValues(closedSummaryTable);
  // formatTable(closedSummaryRange);

  // accountsSheet.autoResizeColumns(1, accountsSheet.getDataRange().getNumColumns());

  let openCryptosTable = cryptoTracker.getOpenCryptosTable();
  writeCryptosTable(openCryptosTable, 'Open Positions', 2, 1);

  let closedCryptosTable = cryptoTracker.getClosedCryptosTable();
  writeCryptosTable(closedCryptosTable, 'Closed Trades', 2, 1);

}

function writeCryptosTable(cryptosTable, sheetName, headerHeight, footerHeight) {

  if (cryptosTable.length == 0) {
    return;
  }

  ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    throw Error(`Sheet (${sheetName}) does not exist.`)

  }

  let dataRange = sheet.getDataRange();

  const dataWidth = cryptosTable[0].length;
  const formulaWidth = dataRange.getWidth() - dataWidth;

  const existingDataHeight = dataRange.getHeight() - headerHeight - footerHeight;
  const freshDataHeight = cryptosTable.length;

  //leave at least two rows to sum formulas working 
  const addRows = Math.max(freshDataHeight, 2) - existingDataHeight;

  //clear existing data
  if (existingDataHeight) {

    let clearDataRange = dataRange.offset(headerHeight, 0, existingDataHeight, dataWidth);
    clearDataRange.clearContent();

  }

  if (addRows > 0) {

    sheet.insertRowsAfter(headerHeight + 1, addRows);

    //copy first row with the formulas to all the inserted rows
    let formulaRange = sheet.getRange(headerHeight + 1, dataWidth + 1, freshDataHeight, formulaWidth);
    let firstFormulaRow = formulaRange.offset(0, 0, 1, formulaWidth);
    firstFormulaRow.copyTo(formulaRange);
  }
  else if (addRows < 0) {

    //delete all rows but not header footer and at least two data row to keep formatting and sum formulas working
    sheet.deleteRows(headerHeight + 1, -addRows);
  }

  //write the fresh data
  let freshDataRange = sheet.getRange(headerHeight + 1, 1, freshDataHeight, dataWidth);
  freshDataRange.setValues(cryptosTable);

  //apply the formulas
  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, sheet.getDataRange().getWidth());

}

function getSheet(name) {

  ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {

    ss.insertSheet(name);
  }
  else {

    sheet.clear();

  }

  return sheet;
}

function formatTable(range) {

  range.setBorder(
    true, true, true, true, null, null,
    null,
    SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  let headerRange = range.offset(0, 0, 1, range.getNumColumns());

  headerRange
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackgroundColor('#007272')
    .setBorder(
      true, true, true, true, null, null,
      null,
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM);



  let columnHeaderRange = range.offset(0, 0, range.getNumRows(), 1);

  columnHeaderRange
    .setFontWeight('bold')
    .setFontStyle('italic')
    .setBorder(
      true, true, true, true, null, null,
      null,
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  let totalRange = range.offset(range.getNumRows() - 1, 0, 1, range.getNumColumns());

  totalRange
    .setFontWeight('bold')
    //.setFontStyle('italic')
    .setBackgroundColor('#76a5af')
    .setBorder(
      true, true, true, true, null, null,
      null,
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

}

function validateLedger() {

  new CryptoTracker().validateLedger();

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);

}

function updateExRates() {

  new CryptoTracker().updateExRates();

}

