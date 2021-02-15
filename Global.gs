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

  let openPositionsTable = cryptoTracker.getOpenPositionsTable();
  dumpData(openPositionsTable, 'Open Positions Data');

  let closedPositionsTable = cryptoTracker.getClosedPositionsTable();
  dumpData(closedPositionsTable, 'Closed Positions Data');

}

function dumpData(dataTable, sheetName) {

  const dataRows = dataTable.length;
  if (dataTable.length > 0) {

    ss = SpreadsheetApp.getActive();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    sheet.clear();

    const dataColumns = dataTable[0].length;

    //Trim the sheet to fit the data
    const totalColumns = sheet.getMaxColumns();
    const totalRows = sheet.getMaxRows();

    //keep at least header and one row for arrayformula references
    const neededRows = Math.max(dataRows, 2);

    const extraColumns = totalColumns - dataColumns;
    const extraRows = totalRows - neededRows;

    if (extraColumns > 0) {
      sheet.deleteColumns(dataColumns + 1, extraColumns);
    }
    else if (extraColumns < 0) {
      sheet.insertColumnsAfter(totalColumns, -extraColumns);
    }

    if (extraRows > 0) {
      sheet.deleteRows(dataRows + 1, extraRows);
    }
    else if (extraRows < 0) {
      sheet.insertRowsAfter(totalRows, -extraRows);
    }

    //write the fresh data
    let dataRange = sheet.getRange(1, 1, dataRows, dataColumns);
    dataRange.setValues(dataTable);

    sheet.autoResizeColumns(1, sheet.getDataRange().getWidth());
  }
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

// function formatTable(range) {

//   range.setBorder(
//     true, true, true, true, null, null,
//     null,
//     SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

//   let headerRange = range.offset(0, 0, 1, range.getNumColumns());

//   headerRange
//     .setFontWeight('bold')
//     .setFontColor('#ffffff')
//     .setBackgroundColor('#007272')
//     .setBorder(
//       true, true, true, true, null, null,
//       null,
//       SpreadsheetApp.BorderStyle.SOLID_MEDIUM);



//   let columnHeaderRange = range.offset(0, 0, range.getNumRows(), 1);

//   columnHeaderRange
//     .setFontWeight('bold')
//     .setFontStyle('italic')
//     .setBorder(
//       true, true, true, true, null, null,
//       null,
//       SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

//   let totalRange = range.offset(range.getNumRows() - 1, 0, 1, range.getNumColumns());

//   totalRange
//     .setFontWeight('bold')
//     //.setFontStyle('italic')
//     .setBackgroundColor('#76a5af')
//     .setBorder(
//       true, true, true, true, null, null,
//       null,
//       SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

// }

function validateLedger() {

  new CryptoTracker().validateLedger();

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);

}

function updateExRates() {

  new CryptoTracker().updateExRates();

}

