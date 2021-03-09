class FiatAccount {

  constructor(currency) {

    this.currency = currency;
    this.cents = 0;

  }

   get balance() {

    return this.cents / 100;

  }

  transfer(amount) {

    this.cents += Math.round(amount * 100); //round because multiplying

    return this;

  }
}
