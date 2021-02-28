function _isLongTerm(date1, date2 = new Date()) {

  date1 = new Date(date1);
  date2 = new Date(date2);
  let years = date2.getFullYear() - date1.getFullYear();
  let months = (years * 12) + (date2.getMonth() - date1.getMonth());
  let days = date2.getDate() - date1.getDate();

  return (months < 12) ? false : (months > 12 || days > 0) ? true : false;

}

function IS_LONG_TERM(input1, input2 = new Date()) {

  return Array.isArray(input1) ?
    Array.isArray(input2) ?
    input1.map((row, i)  => _isLongTerm(row[0], input2[i][0])) :
    input1.map(row => row.map(cell => _isLongTerm(cell))) :
    _isLongTerm(input1, input2);

}
