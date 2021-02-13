function processTrades() {

  let cryptoTracker = new CryptoTracker();

  cryptoTracker.processTrades();
  // let fiatConvert = cryptoTracker.fiatConvert;

  // for (let closedLot of cryptoTracker.closedLots) {

  //   let lot = closedLot.lot;

  //   Logger.log(`[${lot.date.toISOString()}] Lot ${lot.debitWalletName} ${lot.creditCurrency} ${lot.creditAmountSatoshi / 1e8} - ${lot.creditFeeSatoshi / 1e8} = ${lot.satoshi / 1e8}
  //           ${lot.debitCurrency} (${lot.debitAmountSatoshi / 1e8} - ${lot.debitFeeSatoshi / 1e8}) x rate ${lot.debitExRate} = Cost Basis ${fiatConvert} ${lot.costBasisCents / 100}
  //           [${closedLot.date.toISOString()}] Closed ${closedLot.creditWalletName}
  //           ${closedLot.creditCurrency} (${closedLot.creditAmountSatoshi / 1e8} - ${closedLot.creditFeeSatoshi / 1e8}) x rate ${closedLot.creditExRate} = Proceeds ${fiatConvert} ${closedLot.proceedsCents / 100} 
  //           `);
  // }

  // let fiatTable = cryptoTracker.getFiatTable();
  // Logger.log(fiatTable);

  // let cryptoTable = cryptoTracker.getCryptoTable();
  // Logger.log(cryptoTable);

  // let profitTable = cryptoTracker.getProfitTable();
  // Logger.log(profitTable);

  // let closedSummaryTable = cryptoTracker.getClosedSummaryTable();
  // Logger.log(closedSummaryTable);

  let closedDetailsTable = cryptoTracker.getClosedDetailsTable();
  //Logger.log(closedDetailsTable);

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

  // let closedDetailsSheet = getSheet('Closed');

  // let closedDetailsRange = closedDetailsSheet.getRange(1, 1, closedDetailsTable.length, closedDetailsTable[0].length);
  // closedDetailsRange.setValues(closedDetailsTable);

  // closedDetailsSheet.autoResizeColumns(1, closedDetailsSheet.getDataRange().getNumColumns());

  writeClosedDetails(closedDetailsTable);

}

function writeClosedDetails(closedDetailsTable) {

  ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName('Closed Trades');

  //delete existing data rows but leave header, footer and at least one row to retain formatting
  const headerHeight = 2;
  const footerHeight = 1;
  let existingDataRange = sheet.getDataRange();
  let existingDataHeight = existingDataRange.getHeight() - headerHeight;
  let existingDataWidth = existingDataRange.getWidth();

  if (existingDataHeight) {

    let clearDataRange = existingDataRange.offset(headerHeight, 0, existingDataHeight, existingDataWidth);
    clearDataRange.clearContent();

  }

  //delete all rows except header, footer and one data row to keep formaatting
  const keepHeight = headerHeight + footerHeight + 1;
  const deleteHeight = sheet.getMaxRows() - keepHeight;
  if (deleteHeight) {

    sheet.deleteRows(headerHeight + 1, deleteHeight);

  }

  // //write fresh data
  let dataHeight = closedDetailsTable.length
  let dataWidth = closedDetailsTable[0].length;

  //insert rows to keep formatting
  const insertHeight = headerHeight + dataHeight- sheet.getMaxRows();
  if (insertHeight) {
    sheet.insertRowsAfter(headerHeight + 1, insertHeight);
  }

  //write the fresh data
  let closedDetailsRange = sheet.getRange(headerHeight + 1, 1, dataHeight, dataWidth);
  closedDetailsRange.setValues(closedDetailsTable);

  sheet.autoResizeColumns(1, dataWidth);

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

