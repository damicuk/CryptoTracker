CryptoTracker.prototype.handleError = function (error, message, rowIndex, columnName) {


  if (error === 'validation') {

    let ss = SpreadsheetApp.getActive();
    let ledgerSheet = ss.getSheetByName(this.ledgerSheetName);

    if(ledgerSheet) {
      
      let columnIndex = LedgerRecord.getColumnIndex(columnName)
      let range = ledgerSheet.getRange(rowIndex, columnIndex, 1, 1);
      ss.setCurrentCell(range);
      SpreadsheetApp.flush();

    }
    
    SpreadsheetApp.getUi().alert(`Ledger validation failed`, message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
  else if(error === 'api') {

    SpreadsheetApp.getUi().alert(`Failed to update crypto prices`, message, SpreadsheetApp.getUi().ButtonSet.OK);

  }
}
