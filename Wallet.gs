class Wallet {

  constructor(name) {

    this.name = name;
    this.cryptoAccounts = new Map();

  }

  getCryptoAccount(ticker) {

    if (!this.cryptoAccounts.has(ticker)) {

      this.cryptoAccounts.set(ticker, new CryptoAccount(ticker));

    }
    return this.cryptoAccounts.get(ticker);
  }
}