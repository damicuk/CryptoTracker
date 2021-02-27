class Settings {

  constructor() {

    let activeSheet = SpreadsheetApp.getActiveSpreadsheet();
    let multiArray = activeSheet.getSheetByName("Settings").getDataRange().getValues();
    multiArray.shift() //remove header row
    
    for (let array of multiArray) {
      
      let filteredArray = array.filter(function (item) { //remove empty strings

        return item !== '';

      });

      let settingType = filteredArray.shift();

      if (settingType == null) continue; //empty row

      let key = filteredArray.shift();

      if (key == null) continue; //empty row

      if (filteredArray.length == 0) { // no value

        this[key] = null;

      }
      else if (settingType == 'single') {

        this[key] = filteredArray[0];

      }
      else if (settingType == 'multiple') {

        this[key] = new Set(filteredArray);

      }
    }
  }
}