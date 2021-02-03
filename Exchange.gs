class Exchange extends Wallet {

  constructor(name) {

    super(name);
    this.fiatAccounts = new Map();

  }

  getFiatAccount(ticker) {

    if (!this.fiatAccounts.has(ticker)) {

      this.fiatAccounts.set(ticker, new FiatAccount(ticker));

    }
    return this.fiatAccounts.get(ticker);
  }
}
