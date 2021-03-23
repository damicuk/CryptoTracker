/**
 * Creates the fiat accounts sheet if it doesn't already exist
 * Updates the sheet with the current fiat accounts data
 * Trims the sheet to fit the data
 */
CryptoTracker.prototype.fiatAccountsSheet = function () {

  const sheetName = this.fiatAccountsSheetName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [['Wallet', 'Currency', 'Balance']];

    sheet.getRange('A1:C1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    sheet.getRange('A2:A').setNumberFormat('@');
    sheet.getRange('B2:B').setNumberFormat('@');
    sheet.getRange('C2:C').setNumberFormat('#,##0.00;(#,##0.00)');

    sheet.hideSheet();

    let protection = sheet.protect().setDescription('Essential Data Sheet');
    protection.setWarningOnly(true);

  }

  let dataTable = this.getFiatTable();

  this.writeTable(ss, sheet, dataTable, this.fiatAccountsRangeName, 1, 3);

}

/**
 * Returns a table of the current fiat accounts data
 * The fiat accounts data is collected when the ledger is processed
 * @return {*[][]} The current fiat accounts data
 */
CryptoTracker.prototype.getFiatTable = function () {

  let table = [];

  for (let wallet of this.wallets) {

    for (let fiatAccount of wallet.fiatAccounts) {

      table.push([wallet.name, fiatAccount.fiat, fiatAccount.balance]);

    }
  }

  table.sort(function (a, b) {
    return a[0] > b[0] ? 1 : 
          b[0] > a[0] ? -1 : 
          a[1] > b[1] ? 1 : 
          b[1] > a[1] ? -1 : 
          0;
  });

  return table;
}