class CurrencyConversion {

  constructor(date, debitCurrency, creditCurrency, rate) {

    this.date = date;
    this.debitCurrency = debitCurrency;
    this.creditCurrency = creditCurrency;
    this.rate = rate;

  }

  isSameConversion(currencyConversion) {
    
    if(this.date.getTime() == currencyConversion.date.getTime()
          && this.debitCurrency == currencyConversion.debitCurrency
          && this.creditCurrency == creditCurrency.debitCurrency) {

            return true;

    }

    return false;
  }

}
