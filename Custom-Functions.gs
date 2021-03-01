// function _isLongTerm(date1, date2 = new Date()) {

//   const timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
//   return _isLongTermTZ(timezone, date1, date2);
// }

function _isLongTerm(timezone, date1, date2 = new Date()) {

  date1 = convertTZ(date1, timezone);
  date2 = convertTZ(date2, timezone);
  let years = date2.getFullYear() - date1.getFullYear();
  let months = (years * 12) + (date2.getMonth() - date1.getMonth());
  let days = date2.getDate() - date1.getDate();

  return (months < 12) ? false : (months > 12 || days > 0) ? true : false;

}

function IS_LONG_TERM_TZ(timezone, input1, input2 = new Date()) {

  return Array.isArray(input1) ?
    Array.isArray(input2) ?
      input1.map((row, i) => _isLongTerm(timezone, row[0], input2[i][0])) :
      input1.map(row => row.map(cell => _isLongTerm(timezone, cell))) :
    _isLongTerm(timezone, input1, input2);

}

function IS_LONG_TERM(input1, input2 = new Date()) {

  const timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  return IS_LONG_TERM_TZ(timezone, input1, input2);

}

function convertTZ(date, tzString) {

  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
}