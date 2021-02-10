class Wallet {

  constructor(name) {

    this.name = name;
    this._fiatAccounts = new Map();
    this._cryptoAccounts = new Map();
  }

  get hasFiatAccounts() {

    return this._fiatAccounts.size > 0;
  }

  get hasCryptoAccounts() {

    return this._cryptoAccounts.size > 0;
  }

  hasFiatAccount(fiat) {

    return this._fiatAccounts.has(fiat);
  }

  hasCryptoAccount(crypto) {

    return this._cryptoAccounts.has(crypto);
  }

  getCents(fiat) {

    return this._fiatAccounts.get(fiat).cents;
  }

  getSatoshi(crypto) {

    return this._cryptoAccounts.get(crypto).satoshi;
  }

  getFiatAccount(fiat) {

    if (!this._fiatAccounts.has(fiat)) {

      this._fiatAccounts.set(fiat, new FiatAccount(fiat));

    }
    return this._fiatAccounts.get(fiat);
  }

  getCryptoAccount(crypto) {

    if (!this._cryptoAccounts.has(crypto)) {

      this._cryptoAccounts.set(crypto, new CryptoAccount(crypto));

    }
    return this._cryptoAccounts.get(crypto);
  }

  getBalance(fiat) {

    let balance = '0';
    if (this._fiatAccounts.has(fiat)) {
      balance = this._fiatAccounts.get(fiat).balance;
    }
    return balance;
  }

  getBalance(crypto) {

    let balance = '0';
    if (this._cryptoAccounts.has(crypto)) {
      balance = this._cryptoAccounts.get(crypto).balance;
    }
    return balance;
  }
}