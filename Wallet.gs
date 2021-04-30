/**
 * Wallet (or exchange) with fiat and/or cryptocurrency accounts.
 */
class Wallet {

  /**
   * Sets the name of the wallet (or exchange) and initializes empty arrays to contain the fiat and cryptocurrency accounts.
   * @param {string} name - The name of the wallet (or exchange).
   */
  constructor(name) {

    /**
     * The name of the wallet (or exchange) and initializes empty arrays to contain the fiat and cryptocurrency accounts.
     * @type {string}
     */
    this.name = name;

    /**
     * The fiat accounts.
     * @type {Array<FiatAccount>}
     */
    this.fiatAccounts = [];

    /**
     * The cryptocurrency accounts.
     * @type {Array<CryptoAccount>}
     */
    this.cryptoAccounts = [];
  }

  /**
   * Returns the fiat account with the given ticker or creates adds and returns a new fiat account with that ticker.
   * @param {string} ticker - The ticker of the fiat account to search for.
   * @return {FiatAccount} The fiat account found or created.
   */
  getFiatAccount(ticker) {

    for (let fiatAccount of this.fiatAccounts) {

      if (fiatAccount.ticker === ticker) {

        return fiatAccount;
      }
    }

    let fiatAccount = new FiatAccount(ticker);

    this.fiatAccounts.push(fiatAccount);

    return fiatAccount;
  }

  /**
   * Returns the cryptocurrency account with the given ticker or creates adds and returns a new cryptocurrency account with that ticker.
   * @param {string} ticker - The ticker of the cryptocurrency account to search for.
   * @return {CryptoAccount} The cryptocurrency account found or created.
   */
  getCryptoAccount(ticker) {

    for (let cryptoAccount of this.cryptoAccounts) {

      if (cryptoAccount.ticker === ticker) {

        return cryptoAccount;
      }
    }

    let cryptoAccount = new CryptoAccount(ticker);

    this.cryptoAccounts.push(cryptoAccount);

    return cryptoAccount;
  }
}