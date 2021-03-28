// Optional for easier use.
var QUnit = QUnitGS2.QUnit;

// HTML get function
function doGet() {
  QUnitGS2.init();

  testFiatAccount();
  testLot();
  testCryptoAccount();
  testCryptoTracker();

  QUnit.start();
  return QUnitGS2.getHtml();
}

// Retrieve test results when ready.
function getResultsFromServer() {
  return QUnitGS2.getResultsFromServer();
}

function testFiatAccount() {

  QUnit.test('FiatAccount', function (assert) {

    let fiatAccount = new FiatAccount();
    assert.equal(fiatAccount.balance, 0, 'initial balance 0');
    fiatAccount.transfer(1.03);
    assert.equal(fiatAccount.balance, 1.03, 'transfer + whole cents');
    fiatAccount.transfer(0.004);
    assert.equal(fiatAccount.balance, 1.03, 'transfer +0.004 cents');
    fiatAccount.transfer(0.005);
    assert.equal(fiatAccount.balance, 1.04, 'transfer +0.005 cents');
    fiatAccount.transfer(-0.01);
    assert.equal(fiatAccount.balance, 1.03, 'transfer - whole cents');
    fiatAccount.transfer(-0.005);
    assert.equal(fiatAccount.balance, 1.03, 'transfer -0.005 cents');
    fiatAccount.transfer(-0.006);
    assert.equal(fiatAccount.balance, 1.02, 'transfer -0.006 cents');
    fiatAccount.transfer(-2);
    assert.equal(fiatAccount.balance, -0.98, 'negative balance');
  });
}

function testLot() {

  QUnit.test('Lot', function (assert) {

    let lots = [];
    lots.push(new Lot(new Date(2019, 5, 22), 'USD', 0, 10000.02, 10.01, 'BTC', 0.25, 0.0005, 'Kraken'));
    lots.push(new Lot(new Date(2019, 5, 22), 'EUR', 1.2002, 10000.02, 10.01, 'BTC', 0.25, 0.0005, 'Kraken'));
    lots.push(lots[1].duplicate());
    let splitLots = lots[1].split(14000000);

    assert.equal(lots[0].satoshi, 24950000, 'satoshi');
    assert.equal(lots[0].costBasisCents, 1001003, 'costBasisCents debitExRate=0');
    assert.equal(lots[1].costBasisCents, 1201404, 'costBasisCents debitExRate>0');

    assert.equal(lots[2].date, lots[1].date, 'duplicate date');
    assert.equal(lots[2].debitCurrency, lots[1].debitCurrency, 'duplicate debitCurrency');
    assert.equal(lots[2].debitAmountSatoshi, lots[1].debitAmountSatoshi, 'duplicate debitAmountSatoshi');
    assert.equal(lots[2].debitFeeSatoshi, lots[1].debitFeeSatoshi, 'duplicate debitFeeSatoshi');
    assert.equal(lots[2].debitExRate, lots[1].debitExRate, 'duplicate debitExRate');
    assert.equal(lots[2].creditCurrency, lots[1].creditCurrency, 'duplicate creditCurrency');
    assert.equal(lots[2].creditAmountSatoshi, lots[1].creditAmountSatoshi, 'duplicate creditAmountSatoshi');
    assert.equal(lots[2].creditFeeSatoshi, lots[1].creditFeeSatoshi, 'duplicate creditFeeSatoshi');
    assert.equal(lots[2].walletName, lots[1].walletName, 'duplicate walletName');

    assert.equal(splitLots[0].satoshi, 14000000, 'split splitLots[0].satoshi');
    assert.equal(splitLots[1].satoshi, 10950000, 'split splitLots[1].satoshi');

    assert.equal(splitLots[0].date, lots[1].date, 'split splitLots[0].date');
    assert.equal(splitLots[0].debitCurrency, lots[1].debitCurrency, 'split splitLots[0].debitCurrency');
    assert.equal(splitLots[0].debitExRate, lots[1].debitExRate, 'split splitLots[0].debitExRate');
    assert.equal(splitLots[0].creditCurrency, lots[1].creditCurrency, 'split splitLots[0].creditCurrency');
    assert.equal(splitLots[0].walletName, lots[1].walletName, 'split splitLots[0].walletName');

    assert.equal(splitLots[1].date, lots[1].date, 'split splitLots[1].date');
    assert.equal(splitLots[1].debitCurrency, lots[1].debitCurrency, 'split splitLots[1].debitCurrency');
    assert.equal(splitLots[1].debitExRate, lots[1].debitExRate, 'split splitLots[1].debitExRate');
    assert.equal(splitLots[1].creditCurrency, lots[1].creditCurrency, 'split splitLots[1].creditCurrency');
    assert.equal(splitLots[1].walletName, lots[1].walletName, 'split splitLots[1].walletName');

    assert.equal(splitLots[0].debitAmountSatoshi, 561123366733, 'split splitLots[0].debitAmountSatoshi');
    assert.equal(splitLots[0].debitFeeSatoshi, 561683367, 'split splitLots[0].debitFeeSatoshi');
    assert.equal(splitLots[0].creditAmountSatoshi, 14028056, 'split splitLots[0].debitAmountSatoshi');
    assert.equal(splitLots[0].creditFeeSatoshi, 28056, 'split splitLots[0].debitFeeSatoshi');

    assert.equal(splitLots[1].debitAmountSatoshi, 438878633267, 'split splitLots[1].debitAmountSatoshi');
    assert.equal(splitLots[1].debitFeeSatoshi, 439316633, 'split splitLots[1].debitFeeSatoshi');
    assert.equal(splitLots[1].creditAmountSatoshi, 10971944, 'split splitLots[1].debitAmountSatoshi');
    assert.equal(splitLots[1].creditFeeSatoshi, 21944, 'split splitLots[1].debitFeeSatoshi');
  });
}

function testCryptoAccount() {

  QUnit.test('CryptoAccount', function (assert) {

    let cryptoAccount = new CryptoAccount('BTC');
    let lots = [];
    lots.push(new Lot(new Date(2020, 0, 2), 'USD', 0, 40000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 1), 'USD', 0, 20000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 3), 'USD', 0, 10000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 4), 'USD', 0, 60000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 6), 'USD', 0, 30000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 5), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));

    cryptoAccount.deposit(lots);

    let withdrawLots;
    withdrawLots = cryptoAccount.withdraw(1, 0, 'FIFO', 1);
    assert.equal(withdrawLots[0].costBasisCents, 2000000, 'withdraw FIFO');
    withdrawLots = cryptoAccount.withdraw(1, 0, 'LIFO', 1);
    assert.equal(withdrawLots[0].costBasisCents, 3000000, 'withdraw LIFO');
    withdrawLots = cryptoAccount.withdraw(1, 0, 'LOFO', 1);
    assert.equal(withdrawLots[0].costBasisCents, 1000000, 'withdraw LOFO');
    withdrawLots = cryptoAccount.withdraw(1, 0, 'HIFO', 1);
    assert.equal(withdrawLots[0].costBasisCents, 6000000, 'withdraw HIFO');

    cryptoAccount = new CryptoAccount('BTC');
    cryptoAccount.deposit(new Lot(new Date(2020, 0, 1), 'USD', 0, 9900, 100, 'BTC', 1.0005, 0.0005, 'Kraken'));
    cryptoAccount.deposit(new Lot(new Date(2020, 0, 2), 'USD', 0, 19900, 100, 'BTC', 1.0005, 0.0005, 'Kraken'));

    assert.equal(cryptoAccount.satoshi, 200000000, 'deposit satoshi');
    assert.equal(cryptoAccount.balance, 2, 'deposit balance');

    withdrawLots = cryptoAccount.withdraw(1.4997, 0.0003, 'HIFO', 1);

    assert.equal(cryptoAccount.balance, 0.5, 'withdraw split cryptoAccount.balance');
    assert.equal(withdrawLots[0].satoshi, 99980000, 'withdraw split withdrawLots[0].satoshi');
    assert.equal(withdrawLots[0].creditAmountSatoshi, 100050000, 'withdraw split withdrawLots[0].creditAmountSatoshi');
    assert.equal(withdrawLots[0].creditFeeSatoshi, 70000, 'withdraw split withdrawLots[0].creditFeeSatoshi');
    assert.equal(withdrawLots[1].satoshi, 49990000, 'withdraw split withdrawLots[1].satoshi');
    assert.equal(withdrawLots[1].creditAmountSatoshi, 50025000, 'withdraw split withdrawLots[1].creditAmountSatoshi');
    assert.equal(withdrawLots[1].creditFeeSatoshi, 35000, 'withdraw split withdrawLots[1].creditFeeSatoshi');

  });
}

function testCryptoTracker() {

  QUnit.test('CryptoTracker', function (assert) {

    let list = ['Bananas', 'Apples', 'Dates', 'Cherries'];
    list.sort(CryptoTracker.abcComparator);

    assert.equal(list[0], 'Apples', 'abcComparator');
    assert.equal(list[3], 'Dates', 'abcComparator');

    assert.equal(CryptoTracker.decimalDigits(0), 0, 'decimalDigits');
    assert.equal(CryptoTracker.decimalDigits(5), 0, 'decimalDigits');
    assert.equal(CryptoTracker.decimalDigits(2.01), 2, 'decimalDigits');
    assert.equal(CryptoTracker.decimalDigits(''), 0, 'decimalDigits');

    assert.equal(new CryptoTracker().isFiat('USD'), true, 'isFiat USD');
    assert.equal(new CryptoTracker().isFiat('BTC'), false, 'isFiat BTC');
    assert.equal(new CryptoTracker().isFiat('XYZ'), false, 'isFiat XYZ');
    assert.equal(new CryptoTracker().isFiat('A'), false, 'isFiat A');
    assert.equal(new CryptoTracker().isFiat('AAAAAAAAA'), false, 'isFiat AAAAAAAAAA');
    assert.equal(new CryptoTracker().isFiat('AAAAAAAAAA'), false, 'isFiat AAAAAAAAAAA');
    assert.equal(new CryptoTracker().isFiat('$$$'), false, 'isFiat $$$');
    assert.equal(new CryptoTracker().isCrypto('USD'), false, 'isCrypto USD');
    assert.equal(new CryptoTracker().isCrypto('BTC'), true, 'isCrypto BTC');
    assert.equal(new CryptoTracker().isCrypto('XYZ'), true, 'isCrypto XYZ');
    assert.equal(new CryptoTracker().isCrypto('A'), false, 'isCrypto A');
    assert.equal(new CryptoTracker().isCrypto('AAAAAAAAA'), true, 'isCrypto AAAAAAAAAA');
    assert.equal(new CryptoTracker().isCrypto('AAAAAAAAAA'), false, 'isCrypto AAAAAAAAAAA');
    assert.equal(new CryptoTracker().isCrypto('$$$'), false, 'isCrypto $$$');

    let cryptoTracker = new CryptoTracker();

    let lots = [];
    lots.push(new Lot(new Date(2020, 0, 1), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 2), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));

    cryptoTracker.donateLots(lots, new Date(2020, 0, 3), 2, 'Ledger');

    assert.equal(QUnit.equiv(cryptoTracker.donatedLots[0].date, new Date(2020, 0, 3)), true, 'donateLots donatedLots[0].date');
    assert.equal(cryptoTracker.donatedLots[0].exRate, 2, 'donateLots donatedLots[0].exRate');
    assert.equal(cryptoTracker.donatedLots[0].walletName, 'Ledger', 'donateLots donatedLots[0].walletName');
    assert.equal(cryptoTracker.donatedLots.length, 2, 'donateLots donatedLots.length');

    cryptoTracker = new CryptoTracker();

    lots = [];
    lots.push(new Lot(new Date(2020, 0, 1), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 2), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));

    cryptoTracker.closeLots(lots, new Date(2020, 0, 3), 'EUR', 1.2, 140000, 100, 'Binance');

    assert.equal(QUnit.equiv(cryptoTracker.closedLots[0].date, new Date(2020, 0, 3)), true, 'closeLots closedLots[0].date');
    assert.equal(cryptoTracker.closedLots[0].creditCurrency, 'EUR', 'closeLots closedLots[0].creditCurrency');
    assert.equal(cryptoTracker.closedLots[0].creditExRate, 1.2, 'closeLots closedLots[0].creditExRate');
    assert.equal(cryptoTracker.closedLots[0].creditAmountSatoshi, 70000 * 1e8, 'closeLots closedLots[0].creditAmountSatoshi');
    assert.equal(cryptoTracker.closedLots[0].creditFeeSatoshi, 50 * 1e8, 'closeLots closedLots[0].creditFeeSatoshi');
    assert.equal(cryptoTracker.closedLots[0].walletName, 'Binance', 'closeLots walletName');

    assert.equal(QUnit.equiv(cryptoTracker.closedLots[1].date, new Date(2020, 0, 3)), true, 'closeLots closedLots[1].date');
    assert.equal(cryptoTracker.closedLots[1].creditCurrency, 'EUR', 'closeLots closedLots[1].creditCurrency');
    assert.equal(cryptoTracker.closedLots[1].creditExRate, 1.2, 'closeLots closedLots[1].creditExRate');
    assert.equal(cryptoTracker.closedLots[1].creditAmountSatoshi, 70000 * 1e8, 'closeLots closedLots[1].creditAmountSatoshi');
    assert.equal(cryptoTracker.closedLots[1].creditFeeSatoshi, 50 * 1e8, 'closeLots closedLots[1].creditFeeSatoshi');
    assert.equal(cryptoTracker.closedLots[1].walletName, 'Binance', 'closeLots walletName');
  });
}
