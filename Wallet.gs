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

  getFiatCents(fiat) {

    let cents = 0;
    if (this.hasFiatAccount(fiat)) {

      cents = this.getFiatAccount(fiat).cents;

    }
    return cents;
  }

  getCryptoSatoshi(crypto) {

    let satoshi = 0;
    if (this.hasCryptoAccount(crypto)) {

      satoshi = this.getCryptoAccount(crypto).satoshi;

    }
    return satoshi;
  }

  getFiatBalance(fiat) {

    let balance = '0';
    if (this.hasFiatAccount(fiat)) {

      balance = this.getFiatAccount(fiat).balance;

    }
    return balance;
  }

  getCryptoBalance(crypto) {

    let balance = '0';
    if (this.hasCryptoAccount(crypto)) {

      balance = this.getCryptoAccount(crypto).balance;

    }
    return balance;
  }

  getCostBasisCents(crypto) {

    let costBasisCents = 0;
    if (this.hasCryptoAccount(crypto)) {

      costBasisCents = this.getCryptoAccount(crypto).costBasisCents;

    }
    return costBasisCents;
  }
}