// Optional for easier use.
let QUnit = QUnitGS2.QUnit;

// HTML get function
function doGet() {
  QUnitGS2.init();

  testFiatAccount();
  testLot();
  testCryptoAccount();
  testCurrency();
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

    let fiatAccount;

    fiatAccount = new FiatAccount('USD');
    assert.equal(fiatAccount.balance, 0, 'Initial balance 0');

    fiatAccount = new FiatAccount('USD');
    fiatAccount.transfer(1.01);
    assert.equal(fiatAccount.balance, 1.01, 'USD Transfer + whole cents');

    // fiatAccount = new FiatAccount('USD');
    // fiatAccount.transfer(1.014);
    // assert.equal(fiatAccount.balance, 1.01, 'USD Transfer + round down');

    // fiatAccount = new FiatAccount('USD');
    // fiatAccount.transfer(1.015);
    // assert.equal(fiatAccount.balance, 1.02, 'USD Transfer + round up');

    fiatAccount = new FiatAccount('USD');
    fiatAccount.transfer(1);
    fiatAccount.transfer(-0.01);
    assert.equal(fiatAccount.balance, 0.99, 'USD Transfer - whole cents');

    // fiatAccount = new FiatAccount('USD');
    // fiatAccount.transfer(1);
    // fiatAccount.transfer(-0.005);
    // assert.equal(fiatAccount.balance, 1, 'transfer - round up');

    // fiatAccount = new FiatAccount('USD');
    // fiatAccount.transfer(1);
    // fiatAccount.transfer(-0.006);
    // assert.equal(fiatAccount.balance, 0.99, 'transfer - round down');

    fiatAccount = new FiatAccount('USD');
    fiatAccount.transfer(-1);
    assert.equal(fiatAccount.balance, -1, 'transfer - negative balance');

    fiatAccount = new FiatAccount('JPY');
    fiatAccount.transfer(101);
    assert.equal(fiatAccount.balance, 101, 'JPY Transfer + whole yen');

    fiatAccount = new FiatAccount('USD');
    fiatAccount.transfer(100);
    fiatAccount.transfer(-1);
    assert.equal(fiatAccount.balance, 99, 'USD Transfer - whole cents');

  });
}

function testLot() {

  QUnit.test('Lot', function (assert) {

    let lots = [];
    lots.push(new Lot(new Date(2019, 5, 22), 'USD', 0, 10000.02, 10.01, 'BTC', 0.25, 0.0005, 'Kraken'));
    lots.push(new Lot(new Date(2019, 5, 22), 'EUR', 1.2002, 10000.02, 10.01, 'BTC', 0.25, 0.0005, 'Kraken'));
    lots.push(lots[1].duplicate());
    let splitLots = lots[1].split(14000000);

    assert.equal(lots[0].subunits, 24950000, 'subunits');
    assert.equal(lots[0].costBasisSubunits, 1001003, 'costBasisSubunits debitExRate=0');
    assert.equal(lots[1].costBasisSubunits, 1201404, 'costBasisSubunits debitExRate>0');

    assert.equal(lots[2].date, lots[1].date, 'duplicate date');
    assert.equal(lots[2].debitCurrency, lots[1].debitCurrency, 'duplicate debitCurrency');
    assert.equal(lots[2].debitAmountSubunits, lots[1].debitAmountSubunits, 'duplicate debitAmountSubunits');
    assert.equal(lots[2].debitFeeSubunits, lots[1].debitFeeSubunits, 'duplicate debitFeeSubunits');
    assert.equal(lots[2].debitExRate, lots[1].debitExRate, 'duplicate debitExRate');
    assert.equal(lots[2].creditCurrency, lots[1].creditCurrency, 'duplicate creditCurrency');
    assert.equal(lots[2].creditAmountSubunits, lots[1].creditAmountSubunits, 'duplicate creditAmountSubunits');
    assert.equal(lots[2].creditFeeSubunits, lots[1].creditFeeSubunits, 'duplicate creditFeeSubunits');
    assert.equal(lots[2].walletName, lots[1].walletName, 'duplicate walletName');

    assert.equal(splitLots[0].subunits, 14000000, 'split splitLots[0].subunits');
    assert.equal(splitLots[1].subunits, 10950000, 'split splitLots[1].subunits');

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

    assert.equal(splitLots[0].debitAmountSubunits, 561123, 'split splitLots[0].debitAmountSubunits');
    assert.equal(splitLots[0].debitFeeSubunits, 562, 'split splitLots[0].debitFeeSubunits');
    assert.equal(splitLots[0].creditAmountSubunits, 14028056, 'split splitLots[0].debitAmountSubunits');
    assert.equal(splitLots[0].creditFeeSubunits, 28056, 'split splitLots[0].debitFeeSubunits');

    assert.equal(splitLots[1].debitAmountSubunits, 438879, 'split splitLots[1].debitAmountSubunits');
    assert.equal(splitLots[1].debitFeeSubunits, 439, 'split splitLots[1].debitFeeSubunits');
    assert.equal(splitLots[1].creditAmountSubunits, 10971944, 'split splitLots[1].debitAmountSubunits');
    assert.equal(splitLots[1].creditFeeSubunits, 21944, 'split splitLots[1].debitFeeSubunits');
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
    assert.equal(withdrawLots[0].costBasisSubunits, 2000000, 'withdraw FIFO');
    withdrawLots = cryptoAccount.withdraw(1, 0, 'LIFO', 1);
    assert.equal(withdrawLots[0].costBasisSubunits, 3000000, 'withdraw LIFO');
    withdrawLots = cryptoAccount.withdraw(1, 0, 'LOFO', 1);
    assert.equal(withdrawLots[0].costBasisSubunits, 1000000, 'withdraw LOFO');
    withdrawLots = cryptoAccount.withdraw(1, 0, 'HIFO', 1);
    assert.equal(withdrawLots[0].costBasisSubunits, 6000000, 'withdraw HIFO');

    cryptoAccount = new CryptoAccount('BTC');
    cryptoAccount.deposit(new Lot(new Date(2020, 0, 1), 'USD', 0, 9900, 100, 'BTC', 1.0005, 0.0005, 'Kraken'));
    cryptoAccount.deposit(new Lot(new Date(2020, 0, 2), 'USD', 0, 19900, 100, 'BTC', 1.0005, 0.0005, 'Kraken'));

    assert.equal(cryptoAccount.subunits, 200000000, 'deposit subunits');
    assert.equal(cryptoAccount.balance, 2, 'deposit balance');

    withdrawLots = cryptoAccount.withdraw(1.4997, 0.0003, 'HIFO', 1);

    assert.equal(cryptoAccount.balance, 0.5, 'withdraw split cryptoAccount.balance');
    assert.equal(withdrawLots[0].subunits, 99980000, 'withdraw split withdrawLots[0].subunits');
    assert.equal(withdrawLots[0].creditAmountSubunits, 100050000, 'withdraw split withdrawLots[0].creditAmountSubunits');
    assert.equal(withdrawLots[0].creditFeeSubunits, 70000, 'withdraw split withdrawLots[0].creditFeeSubunits');
    assert.equal(withdrawLots[1].subunits, 49990000, 'withdraw split withdrawLots[1].subunits');
    assert.equal(withdrawLots[1].creditAmountSubunits, 50025000, 'withdraw split withdrawLots[1].creditAmountSubunits');
    assert.equal(withdrawLots[1].creditFeeSubunits, 35000, 'withdraw split withdrawLots[1].creditFeeSubunits');

  });
}

function testCurrency() {


  QUnit.test('CryptoTracker', function (assert) {

    assert.equal(Currency.decimalDigits(0), 0, 'decimalDigits');
    assert.equal(Currency.decimalDigits(5), 0, 'decimalDigits');
    assert.equal(Currency.decimalDigits(2.01), 2, 'decimalDigits');
    assert.equal(Currency.decimalDigits(''), 0, 'decimalDigits');

    assert.equal(Currency.isFiat('USD'), true, 'isFiat USD');
    assert.equal(Currency.isFiat('BTC'), false, 'isFiat BTC');
    assert.equal(Currency.isFiat('XYZ'), false, 'isFiat XYZ');
    assert.equal(Currency.isFiat('A'), false, 'isFiat A');
    assert.equal(Currency.isFiat('AAAAAAAAA'), false, 'isFiat AAAAAAAAAA');
    assert.equal(Currency.isFiat('AAAAAAAAAA'), false, 'isFiat AAAAAAAAAAA');
    assert.equal(Currency.isFiat('$$$'), false, 'isFiat $$$');
    assert.equal(Currency.isCrypto('USD'), false, 'isCrypto USD');
    assert.equal(Currency.isCrypto('BTC'), true, 'isCrypto BTC');
    assert.equal(Currency.isCrypto('XYZ'), true, 'isCrypto XYZ');
    assert.equal(Currency.isCrypto('A'), false, 'isCrypto A');
    assert.equal(Currency.isCrypto('AAAAAAAAA'), true, 'isCrypto AAAAAAAAAA');
    assert.equal(Currency.isCrypto('AAAAAAAAAA'), false, 'isCrypto AAAAAAAAAAA');
    assert.equal(Currency.isCrypto('$$$'), false, 'isCrypto $$$');

    assert.equal(Currency.validDecimalDigits(''), 8, 'validDecimalDigits empty');
    assert.equal(Currency.validDecimalDigits('USD'), 2, 'validDecimalDigits USD');
    assert.equal(Currency.validDecimalDigits('JPY'), 0, 'validDecimalDigits JPY');
    assert.equal(Currency.validDecimalDigits('BTC'), 8, 'validDecimalDigits BTC');
    assert.equal(Currency.validDecimalDigits('ADA'), 6, 'validDecimalDigits ADA');

  });
}

function testCryptoTracker() {

  QUnit.test('CryptoTracker', function (assert) {

    let list = ['Bananas', 'Apples', 'Dates', 'Cherries'];
    list.sort(CryptoTracker.abcComparator);

    assert.equal(list[0], 'Apples', 'abcComparator');
    assert.equal(list[3], 'Dates', 'abcComparator');

    let integerArray;
    integerArray = [3 ,1, 5, 2, 4];
    let resultsArray = CryptoTracker.apportionInteger(6, integerArray);
    assert.deepEqual(resultsArray, [1, 0, 2, 1, 2], 'Apportion Integer no adjust');

    integerArray = [3 ,1, 5, 2, 4];
    resultsArray = CryptoTracker.apportionInteger(7, integerArray);
    assert.deepEqual(resultsArray, [1, 1, 2, 1, 2], 'Apportion integer adjust add');

    integerArray = [3 ,1, 5, 2, 4];
    resultsArray = CryptoTracker.apportionInteger(23, integerArray);
    assert.deepEqual(resultsArray, [5, 1, 8, 3, 6], 'Apportion Integer adjust subtract');

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
    assert.equal(cryptoTracker.closedLots[0].creditAmountSubunits, 7000000, 'closeLots closedLots[0].creditAmountSubunits');
    assert.equal(cryptoTracker.closedLots[0].creditFeeSubunits, 5000, 'closeLots closedLots[0].creditFeeSubunits');
    assert.equal(cryptoTracker.closedLots[0].walletName, 'Binance', 'closeLots walletName');

    assert.equal(QUnit.equiv(cryptoTracker.closedLots[1].date, new Date(2020, 0, 3)), true, 'closeLots closedLots[1].date');
    assert.equal(cryptoTracker.closedLots[1].creditCurrency, 'EUR', 'closeLots closedLots[1].creditCurrency');
    assert.equal(cryptoTracker.closedLots[1].creditExRate, 1.2, 'closeLots closedLots[1].creditExRate');
    assert.equal(cryptoTracker.closedLots[1].creditAmountSubunits, 7000000, 'closeLots closedLots[1].creditAmountSubunits');
    assert.equal(cryptoTracker.closedLots[1].creditFeeSubunits, 5000, 'closeLots closedLots[1].creditFeeSubunits');
    assert.equal(cryptoTracker.closedLots[1].walletName, 'Binance', 'closeLots walletName');
  });
}
