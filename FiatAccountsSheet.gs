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

  this.writeTable(sheet, dataTable, 1, 3);

}

CryptoTracker.prototype.getFiatTable = function () {

  let table = [];

  for (let wallet of this.wallets) {

    for (let fiatAccount of wallet.fiatAccounts) {

      table.push([wallet.name, fiatAccount.fiat, fiatAccount.balance]);

    }
  }

  return this.sortTable(table, 0);
}