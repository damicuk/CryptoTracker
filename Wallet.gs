class Wallet {

  constructor(name) {

    this.name = name;
    this._fiatAccounts = new Map();
    this._cryptoAccounts = new Map();
  }

  get fiatAccounts() {

    return Array.from(this._fiatAccounts.values());
  }

  get fiats() {

    return Array.from(this._fiatAccounts.keys());
  }

  get cryptoAccounts() {

    return Array.from(this._cryptoAccounts.values());
  }

  get cryptos() {

    return Array.from(this._cryptoAccounts.keys());
  }

  hasFiatAccount(fiat) {

    return this._fiatAccounts.has(fiat);
  }

  hasCryptoAccount(crypto) {

    return this._cryptoAccounts.has(crypto);
  }

  getFiatAccount(fiat) {

    if (!this.hasFiatAccount(fiat)) {

      this._fiatAccounts.set(fiat, new FiatAccount(fiat));

    }
    return this._fiatAccounts.get(fiat);
  }

  getCryptoAccount(crypto) {

    if (!this.hasCryptoAccount(crypto)) {

      this._cryptoAccounts.set(crypto, new CryptoAccount(crypto));

    }
    return this._cryptoAccounts.get(crypto);
  }
}