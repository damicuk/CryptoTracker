CryptoTracker.prototype.exRatesTable = function() {

  const sheetName = this.settings['Ex Rates Table'];
  const referenceSheetName = this.settings['Ex Rates Sheet'];

  let sheet = this.getSheet(sheetName);
  
  sheet.getRange('B1').setFormula(`=TRANSPOSE(SORT(UNIQUE('${referenceSheetName}'!C2:C)))`);
  sheet.getRange('A2').setFormula(`=SORT(UNIQUE('${referenceSheetName}'!C2:C))`);
  sheet.getRange('A3').setFormula(`=SORT(UNIQUE('${referenceSheetName}'!B2:B))`);
  sheet.getRange('B3').setFormula(`=ArrayFormula(VLOOKUP('${referenceSheetName}'!B2:B&'${referenceSheetName}'!C2:C, '${referenceSheetName}'!B2:D, 3))`);
  sheet.getRange('C1').setFormula(`=TRANSPOSE(SORT(UNIQUE('${referenceSheetName}'!B2:B)))`);
  sheet.getRange('C2').setFormula(`=TRANSPOSE(ArrayFormula(FILTER(1/B3:B, LEN(B3:B))))`);
  sheet.getRange('C3').setFormula(`=ArrayFormula(FILTER(FILTER(IF(A3:A=C1:1,,B3:B*C2:2), LEN(B3:B)), LEN(C2:2)))`);

  sheet.getRange('A1:1').setFontWeight('bold').setHorizontalAlignment("center").setBorder(null, null, true, null, null, null);
  sheet.getRange('A1:A').setFontWeight('bold').setHorizontalAlignment("center").setBorder(null, null, null, true, null, null);
  
  sheet.getRange(2, 2, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('#,##0.000000;(#,##0.000000)');

  SpreadsheetApp.flush();

  let dataRange = sheet.getDataRange();

  this.addEmptyCondtion(sheet, dataRange);

  this.trimSheet(sheet, dataRange.getHeight(), dataRange.getWidth());

}
