class HistCryptoRecord {

  constructor(
    date,
    crypto,
    fiat,
    exRate) {

    this.date = new Date(date);
    this.crypto = crypto;
    this.fiat = fiat;
    this.exRate = Number(exRate);

  }

}
