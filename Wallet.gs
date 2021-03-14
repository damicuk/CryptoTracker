class Wallet {

  constructor(name) {

    this.name = name;
    this.fiatAccounts = new Set();
    this.cryptoAccounts = new Set();
  }
  
  getFiatAccount(fiat) {

    for(let fiatAccount of this.fiatAccounts) {
      if(fiatAccount.currency == fiat) {
        return fiatAccount;
      }
    }

    let fiatAccount = new FiatAccount(fiat);
    this.fiatAccounts.add(fiatAccount);
    return fiatAccount;
  }

  getCryptoAccount(crypto) {

    for(let cryptoAccount of this.cryptoAccounts) {
      if(cryptoAccount.currency == crypto) {
        return cryptoAccount;
      }
    }

    let cryptoAccount = new CryptoAccount(crypto);
    this.cryptoAccounts.add(cryptoAccount);
    return cryptoAccount;
  }
}