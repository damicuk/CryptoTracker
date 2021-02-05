class Wallet {

  constructor(name) {

    this.name = name;
    this.cryptoAccounts = new Map();
    this.fiatAccounts = new Map();
  }

  getCryptoAccount(ticker) {

    if (!this.cryptoAccounts.has(ticker)) {

      this.cryptoAccounts.set(ticker, new CryptoAccount(ticker));

    }
    return this.cryptoAccounts.get(ticker);
  }

  getFiatAccount(ticker) {

    if (!this.fiatAccounts.has(ticker)) {

      this.fiatAccounts.set(ticker, new FiatAccount(ticker));

    }
    return this.fiatAccounts.get(ticker);
  }
  
}