class Settings {

  constructor() {
    
    let activeSheet = SpreadsheetApp.getActiveSpreadsheet();
    let multiArray = activeSheet.getSheetByName("Settings").getDataRange().getValues();
    multiArray.shift() //remove header row

    for (let i = 0; i < multiArray.length; i++) {

      let filteredArray = multiArray[i].filter(function (item) { //remove empty strings

        return item != '';

      });

      let settingType = filteredArray.shift();

      if (settingType == null) continue; //empty row

      let key = filteredArray.shift();

      if (key == null) continue; //empty row

      if (filteredArray.length == 0) { // no value

        this[key] = null;

      }
      else if (settingType == 'single') {  // single value

        this[key] = filteredArray[0]

      }
      else if (settingType == 'multiple') {  //multiple values
        
        this[key] = new Set(filteredArray)

      }
    }
  }
}