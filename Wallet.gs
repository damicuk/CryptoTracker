class Wallet {

  constructor(name) {

    this.name = name;
    this.fiatAccounts = new Array();
    this.cryptoAccounts = new Array();
  }

  get hasFiat() {

    return this.fiatAccounts.length > 0;
  }

  getFiatAccount(fiat, construct = true) {

    for (let fiatAccount of this.fiatAccounts) {
      if (fiatAccount.fiat == fiat) {
        return fiatAccount;
      }
    }

    if (construct) {
      let fiatAccount = new FiatAccount(fiat);
      this.fiatAccounts.push(fiatAccount);
      return fiatAccount;
    }

    return null;
  }

  getCryptoAccount(crypto) {

    for (let cryptoAccount of this.cryptoAccounts) {
      if (cryptoAccount.crypto == crypto) {
        return cryptoAccount;
      }
    }

    let cryptoAccount = new CryptoAccount(crypto);
    this.cryptoAccounts.push(cryptoAccount);
    return cryptoAccount;
  }
}