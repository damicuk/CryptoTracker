class FiatAccount {

  constructor(currency) {

    this.currency = currency;
    this.cents = 0;
    
  }

  transfer(amount) {

    this.cents += Math.round(amount * 100); //round because multiplying

    return this;

  }

  get balance() {

    return this.cents / 100;

  }
}
