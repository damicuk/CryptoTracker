CryptoTracker.prototype.fiatWalletsReport = function () {

  const sheetName = this.fiatWalletsReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    sheet.setFrozenRows(1);

    sheet.getRange('A1:1').setFontWeight('bold').setHorizontalAlignment("center");
    sheet.getRange('A2:A').setNumberFormat('@');
    sheet.getRange(2, 2, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('#,##0.00;(#,##0.00)');

    let protection = sheet.protect().setDescription('Essential Data Sheet');
    protection.setWarningOnly(true);

  }

  let dataTable = this.getFiatTable();

  const dataRows = dataTable.length;

  const dataColumns = dataTable[0].length;

  //keep at least headers and one data cell
  const neededRows = Math.max(dataRows, 2);

  const neededColumns = Math.max(dataColumns, 2);

  this.trimSheet(sheet, neededRows, neededColumns);

  sheet.clearContents();

  let dataRange = sheet.getRange(1, 1, dataRows, dataColumns);

  dataRange.setValues(dataTable);

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, sheet.getMaxColumns());

}

CryptoTracker.prototype.getFiatTable = function () {

  let fiats = Array.from(this.fiats);
  fiats.sort(function (a, b) {
    return a > b ? 1 : b > a ? -1 : 0;
  });

  let headers = ['Wallets'].concat(fiats);

  let table = [];

  for (let wallet of this.wallets) {

    if (wallet.hasFiat) {

      let row = [wallet.name];

      for (let fiat of fiats) {

        let balance = 0;

        for (let fiatAccount of wallet.fiatAccounts) {

          if (fiatAccount.fiat == fiat) {

            balance = fiatAccount.balance;

          }

        }

        row.push(balance);
      }

      table.push(row);
    }
  }

  table.sort(function (a, b) {
    return a[0] > b[0] ? 1 : b[0] > a[0] ? -1 : 0;
  });

  table.unshift(headers);

  return table;
}
