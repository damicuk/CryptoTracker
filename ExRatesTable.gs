/**
 * Creates the exrates table sheet if it doesn't already exist
 * No data is writen to this sheet
 * It contains formulas that pull data from other sheets
 */
CryptoTracker.prototype.exRatesTable = function () {

  const sheetName = this.exRatesTableSheetName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;
  }

  sheet = ss.insertSheet(sheetName);

  const referenceRangeName = this.exRatesRangeName;

  sheet.getRange('B1').setFormula(`TRANSPOSE(SORT(UNIQUE(Filter(${referenceRangeName}, {false, false, true, false}))))`);
  sheet.getRange('A2').setFormula(`SORT(UNIQUE(Filter(${referenceRangeName}, {false, false, true, false})))`);
  sheet.getRange('A3').setFormula(`SORT(UNIQUE(Filter(${referenceRangeName}, {false, true, false, false})))`);
  sheet.getRange('B3').setFormula(`IF(NOT(LEN(A3)),,ArrayFormula(VLOOKUP(FILTER(A3:A, LEN(A3:A))&B$1 ,{Filter(${referenceRangeName}, {false, true, false, false})&Filter(${referenceRangeName}, {false, false, true, false}),Filter(${referenceRangeName}, {false, false, false, true})}, 2, FALSE)))`);
  sheet.getRange('C1').setFormula(`TRANSPOSE(SORT(UNIQUE(Filter(${referenceRangeName}, {false, true, false, false}))))`);
  sheet.getRange('C2').setFormula(`IF(NOT(LEN(A3)),,TRANSPOSE(ArrayFormula(FILTER(1/B3:B, LEN(B3:B)))))`);
  sheet.getRange('C3').setFormula(`IF(NOT(LEN(A3)),,ArrayFormula(FILTER(FILTER(IF(A3:A=C1:1,,B3:B*C2:2), LEN(B3:B)), LEN(C2:2))))`);

  sheet.getRange('A1:1').setFontWeight('bold').setHorizontalAlignment("center");
  sheet.getRange('A1:A').setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);

  sheet.getRange(2, 2, sheet.getMaxRows() - 1, sheet.getMaxColumns() - 1).setNumberFormat('#,##0.000000;(#,##0.000000)');

  SpreadsheetApp.flush();
}
