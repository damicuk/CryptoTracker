class Wallet {

  constructor(name) {

    this.name = name;
    this.fiatAccounts = new Array();
    this.cryptoAccounts = new Array();
  }

  getFiatAccount(fiat) {

    for (let fiatAccount of this.fiatAccounts) {

      if (fiatAccount.fiat == fiat) {

        return fiatAccount;
      }
    }

    let fiatAccount = new FiatAccount(fiat);

    this.fiatAccounts.push(fiatAccount);

    return fiatAccount;
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