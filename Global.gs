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
  
  let closedTradesTable = cryptoTracker.getClosedTradesTable();
  writeClosedTrades(closedTradesTable);

}

function writeClosedTrades(closedTradesTable) {

  ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName('Closed Trades');

  //get existing data range
  const headerHeight = 2;
  const footerHeight = 1;
  const dataWidth = 15;

  let dataRange = sheet.getDataRange();
  let existingDataHeight = dataRange.getHeight() - headerHeight - footerHeight;

  //clear existing data
  if (existingDataHeight) {

    let clearDataRange = dataRange.offset(headerHeight, 0, existingDataHeight, dataWidth);
    clearDataRange.clearContent();

  }

  //delete all rows except header, footer and two data row to keep formatting and sum formulas working
  const keepHeight = headerHeight + 2 + footerHeight;
  const deleteHeight = sheet.getMaxRows() - keepHeight;
  if (deleteHeight) {

    sheet.deleteRows(headerHeight + 1, deleteHeight);

  }

  // //write fresh data
  let freshDataHeight = closedTradesTable.length;

  //insert rows to keep formatting
  const insertHeight = headerHeight + freshDataHeight + footerHeight - sheet.getMaxRows();
  if (insertHeight) {
    sheet.insertRowsAfter(headerHeight + 1, insertHeight);
  }

  //write the fresh data
  let freshDataRange = sheet.getRange(headerHeight + 1, 1, freshDataHeight, dataWidth);
  freshDataRange.setValues(closedTradesTable);

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

