/**
 * Wallet (or exchange) with fiat and/or cryptocurrency accounts
 * @class
 */
class Wallet {

  /**
   * @constructor Sets the name of the wallet (or exchange) and initializes empty arrays to contain the fiat and cryptocurrency accounts
   * @param {string} name - The name of the wallet (or exchange)
   */
  constructor(name) {

    this.name = name;
    this.fiatAccounts = [];
    this.cryptoAccounts = [];
  }

  /**
   * Returns the fiat account with the given ticker or creates adds and returns a new fiat account with that ticker
   * @param {string} fiat - The ticker of the fiat account to search for
   * @return {FiatAccount} The fiat account found or created   
   */
  getFiatAccount(fiat) {

    for (let fiatAccount of this.fiatAccounts) {

      if (fiatAccount.fiat === fiat) {

        return fiatAccount;
      }
    }

    let fiatAccount = new FiatAccount(fiat);

    this.fiatAccounts.push(fiatAccount);

    return fiatAccount;
  }

  /**
   * Returns the cryptocurrency account with the given ticker or creates adds and returns a new cryptocurrency account with that ticker
   * @param {string} crypto - The ticker of the cryptocurrency account to search for
   * @return {CryptoAccount} The cryptocurrency account found or created   
   */
  getCryptoAccount(crypto) {

    for (let cryptoAccount of this.cryptoAccounts) {

      if (cryptoAccount.crypto === crypto) {

        return cryptoAccount;
      }
    }

    let cryptoAccount = new CryptoAccount(crypto);

    this.cryptoAccounts.push(cryptoAccount);

    return cryptoAccount;
  }
}