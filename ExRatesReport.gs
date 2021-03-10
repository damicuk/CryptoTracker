function exRatesReport() {

  const sheetName = 'Ex Rates 2';
  const referenceSheetName = 'Current Ex Rates';

  let sheet = ReportHelper.getSheet(sheetName);
  
  sheet.getRange('B1').setFormula(`=TRANSPOSE(SORT(UNIQUE('${referenceSheetName}'!C2:C)))`);
  sheet.getRange('A2').setFormula(`=SORT(UNIQUE('${referenceSheetName}'!C2:C))`);
  sheet.getRange('A3').setFormula(`=SORT(UNIQUE('${referenceSheetName}'!B2:B))`);
  sheet.getRange('B3').setFormula(`=ArrayFormula(VLOOKUP('${referenceSheetName}'!B2:B&'${referenceSheetName}'!C2:C, '${referenceSheetName}'!B2:D, 3))`);
  sheet.getRange('C1').setFormula(`=TRANSPOSE(SORT(UNIQUE('${referenceSheetName}'!B2:B)))`);
  sheet.getRange('C2').setFormula(`=TRANSPOSE(ArrayFormula(FILTER(1/B3:B, LEN(B3:B))))`);
  sheet.getRange('C3').setFormula(`=ArrayFormula(FILTER(FILTER(IF(A3:A=C1:1,,B3:B*C2:2), LEN(B3:B)), LEN(C2:2)))`);

  sheet.getRange('A1:1').setFontWeight('bold').setHorizontalAlignment("center");
  sheet.getRange('A1:A').setFontWeight('bold').setHorizontalAlignment("center");

  sheet.getRange(2, 2, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('#,##0.000000;(#,##0.000000)');

  SpreadsheetApp.flush();

}
