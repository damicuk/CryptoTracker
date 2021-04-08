// Optional for easier use.
let QUnit = QUnitGS2.QUnit;

// HTML get function
function doGet() {
  QUnitGS2.init();

  testFiatAccount();
  testLot();
  testClosedLot();
  testDonatedLot();
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
    assert.equal(fiatAccount.ticker, 'USD', 'ticker');
    assert.equal(fiatAccount.currencySubunits, 100, 'currencySubunits');
    assert.equal(fiatAccount.subunits, 0, 'subunits 0');
    assert.equal(fiatAccount.balance, 0, 'balance 0');

    fiatAccount = new FiatAccount('USD');
    fiatAccount.transfer(1.01);
    assert.equal(fiatAccount.balance, 1.01, 'USD transfer +');

    fiatAccount = new FiatAccount('USD');
    fiatAccount.transfer(1);
    fiatAccount.transfer(-0.01);
    assert.equal(fiatAccount.balance, 0.99, 'USD transfer -');

    fiatAccount = new FiatAccount('USD');
    fiatAccount.transfer(-1);
    assert.equal(fiatAccount.balance, -1, 'USD transfer - balance');

    fiatAccount = new FiatAccount('JPY');
    fiatAccount.transfer(101);
    assert.equal(fiatAccount.balance, 101, 'JPY transfer +');

    fiatAccount = new FiatAccount('JPY');
    fiatAccount.transfer(100);
    fiatAccount.transfer(-1);
    assert.equal(fiatAccount.balance, 99, 'JPY transfer -');

  });
}

function testLot() {

  QUnit.test('Lot', function (assert) {

    let lot;

    lot = new Lot(new Date(2019, 5, 22), 'USD', 0, 10000.02, 10.01, 'BTC', 0.25000002, 0.00050001, 'Kraken');
    assert.equal(QUnit.equiv(lot.date, new Date(2019, 5, 22)), true, 'date');
    assert.equal(lot.debitCurrency, 'USD', 'debitCurrency');
    assert.equal(lot.debitCurrencySubunits, 100, 'debitCurrencySubunits USD');
    assert.equal(lot.debitExRate, 0, 'debitExRate = 0');
    assert.equal(lot.debitAmountSubunits, 1000002, 'debitAmountSubunits');
    assert.equal(lot.debitFeeSubunits, 1001, 'debitFeeSubunits');
    assert.equal(lot.creditCurrency, 'BTC', 'creditCurrency');
    assert.equal(lot.creditCurrencySubunits, 100000000, 'creditCurrencySubunits BTC');
    assert.equal(lot.creditAmountSubunits, 25000002, 'creditAmountSubunits BTC');
    assert.equal(lot.creditFeeSubunits, 50001, 'creditFeeSubunits BTC');
    assert.equal(lot.walletName, 'Kraken', 'walletName');
    assert.equal(lot.debitAmount, 10000.02, 'debitAmount');
    assert.equal(lot.debitFee, 10.01, 'debitFee');
    assert.equal(lot.creditAmount, 0.25000002, 'creditAmount');
    assert.equal(lot.creditFee, 0.00050001, 'creditFee');
    assert.equal(lot.subunits, 24950001, 'subunits');
    assert.equal(lot.costBasisSubunits, 1001003, 'costBasisSubunits');

    lot = new Lot(new Date(2019, 5, 22), 'EUR', 1.20000001, 10000.02, 10.01, 'ADA', 40000.000002, 10.000001, 'Kraken');
    assert.equal(lot.debitExRate, 1.20000001, 'debitExRate > 0');
    assert.equal(lot.creditCurrencySubunits, 1000000, 'creditCurrencySubunits ADA');
    assert.equal(lot.creditAmountSubunits, 40000000002, 'creditAmountSubunits ADA');
    assert.equal(lot.creditFeeSubunits, 10000001, 'creditFeeSubunits ADA');
    assert.equal(lot.costBasisSubunits, 1201204, 'costBasisSubunits debitExRate > 0');

    lot = new Lot(new Date(2019, 5, 22), 'JPY', 0, 1000002, 1001, 'BTC', 0.25000002, 0.00050001, 'Kraken');
    assert.equal(lot.debitCurrencySubunits, 1, 'debitCurrencySubunits JPY');
    assert.equal(lot.debitAmountSubunits, 1000002, 'debitAmountSubunits JPY');
    assert.equal(lot.debitFeeSubunits, 1001, 'debitFeeSubunits JPY');

    lot = new Lot(new Date(2019, 5, 22), 'EUR', 1.2002, 10000.02, 10.01, 'BTC', 0.25, 0.0005, 'Kraken');
    lot.debitAmountSubunits = 1000003;
    lot.debitFeeSubunits = 1002;
    lot.creditAmountSubunits = 25000002;
    lot.creditFeeSubunits = 50001;
    assert.equal(lot.debitAmountSubunits, 1000003, 'debitAmountSubunits change');
    assert.equal(lot.debitFeeSubunits, 1002, 'debitFeeSubunits change');
    assert.equal(lot.creditAmountSubunits, 25000002, 'creditAmountSubunits change');
    assert.equal(lot.creditFeeSubunits, 50001, 'creditFeeSubunits change');
    assert.equal(lot.debitAmount, 10000.03, 'debitAmount change');
    assert.equal(lot.debitFee, 10.02, 'debitFee change');
    assert.equal(lot.creditAmount, 0.25000002, 'creditAmount change');
    assert.equal(lot.creditFee, 0.00050001, 'creditFee change');

    lot = new Lot(new Date(2019, 5, 22), 'EUR', 1.2002, 10000.02, 10.01, 'BTC', 0.25, 0.0005, 'Kraken');
    lot = lot.duplicate();

    assert.equal(QUnit.equiv(lot.date, new Date(2019, 5, 22)), true, 'duplicate date');
    assert.equal(lot.debitCurrency, 'EUR', 'duplicate debitCurrency');
    assert.equal(lot.debitExRate, 1.2002, 'duplicate debitExRate');
    assert.equal(lot.debitAmountSubunits, 1000002, 'duplicate debitAmountSubunits');
    assert.equal(lot.debitFeeSubunits, 1001, 'duplicate debitFeeSubunits');
    assert.equal(lot.creditCurrency, 'BTC', 'duplicate creditCurrency');
    assert.equal(lot.creditAmountSubunits, 25000000, 'duplicate creditAmountSubunits');
    assert.equal(lot.creditFeeSubunits, 50000, 'duplicate creditFeeSubunits');
    assert.equal(lot.walletName, 'Kraken', 'duplicate walletName');

    lot = new Lot(new Date(2019, 5, 22), 'EUR', 1.2002, 10000.02, 10.01, 'BTC', 0.25, 0.0005, 'Kraken');
    let splitLots = lot.split(14000000);

    assert.equal(splitLots[0].subunits, 14000000, 'split splitLots[0].subunits');
    assert.equal(splitLots[1].subunits, 10950000, 'split splitLots[1].subunits');

    assert.equal(QUnit.equiv(splitLots[0].date, new Date(2019, 5, 22)), true, 'split splitLots[0].date');
    assert.equal(splitLots[0].debitCurrency, 'EUR', 'split splitLots[0].debitCurrency');
    assert.equal(splitLots[0].debitExRate, 1.2002, 'split splitLots[0].debitExRate');
    assert.equal(splitLots[0].creditCurrency, 'BTC', 'split splitLots[0].creditCurrency');
    assert.equal(splitLots[0].walletName, 'Kraken', 'split splitLots[0].walletName');

    assert.equal(QUnit.equiv(splitLots[1].date, new Date(2019, 5, 22)), true, 'split splitLots[1].date');
    assert.equal(splitLots[1].debitCurrency, 'EUR', 'split splitLots[1].debitCurrency');
    assert.equal(splitLots[1].debitExRate, 1.2002, 'split splitLots[1].debitExRate');
    assert.equal(splitLots[1].creditCurrency, 'BTC', 'split splitLots[1].creditCurrency');
    assert.equal(splitLots[1].walletName, 'Kraken', 'split splitLots[1].walletName');

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

function testClosedLot() {

  QUnit.test('ClosedLot', function (assert) {

    let lot;
    let closedLot;

    lot = new Lot(new Date(2019, 5, 22), 'EUR', 1.2002, 10000.02, 10.01, 'BTC', 0.25, 0.0005, 'Kraken');
    closedLot = new ClosedLot(lot, new Date(2020, 3, 23), 'GBP', 1.30000001, 20000.02, 20.01, 'Binance');
    assert.deepEqual(closedLot.lot, lot, 'lot');
    assert.equal(QUnit.equiv(closedLot.date, new Date(2020, 3, 23)), true, 'date');
    assert.equal(closedLot.creditCurrency, 'GBP', 'creditCurrency');
    assert.equal(closedLot.creditCurrencySubunits, 100, 'creditCurrencySubunits');
    assert.equal(closedLot.creditExRate, 1.30000001, 'creditExRate');
    assert.equal(closedLot.creditAmountSubunits, 2000002, 'creditAmountSubunits');
    assert.equal(closedLot.creditFeeSubunits, 2001, 'creditFeeSubunits');
    assert.equal(closedLot.walletName, 'Binance', 'walletName');
    assert.equal(closedLot.creditAmount, 20000.02, 'creditAmount');
    assert.equal(closedLot.creditFee, 20.01, 'creditFee');

    lot = new Lot(new Date(2019, 5, 22), 'EUR', 1.2002, 10000.02, 10.01, 'BTC', 0.25, 0.0005, 'Kraken');
    closedLot = new ClosedLot(lot, new Date(2020, 3, 23), 'GBP', 1.30000001, 20000.02, 20.01, 'Binance');
    closedLot.creditAmountSubunits = 2000003;
    closedLot.creditFeeSubunits = 2002;
    assert.equal(closedLot.creditAmountSubunits, 2000003, 'creditAmountSubunits change');
    assert.equal(closedLot.creditFeeSubunits, 2002, 'creditFeeSubunits change');
    assert.equal(closedLot.creditAmount, 20000.03, 'creditAmount change');
    assert.equal(closedLot.creditFee, 20.02, 'creditFee change');

  });
}

function testDonatedLot() {

  QUnit.test('DonateLot', function (assert) {

    let lot = new Lot(new Date(2019, 5, 22), 'EUR', 1.2002, 10000.02, 10.01, 'BTC', 0.25, 0.0005, 'Kraken');
    let donatedLot = new DonatedLot(lot, new Date(2020, 3, 23), 1.30000001, 'Ledger');
    assert.deepEqual(donatedLot.lot, lot, 'lot');
    assert.equal(QUnit.equiv(donatedLot.date, new Date(2020, 3, 23)), true, 'date');
    assert.equal(donatedLot.exRate, 1.30000001, 'exRate');
    assert.equal(donatedLot.walletName, 'Ledger', 'walletName');

  });
}

function testCryptoAccount() {

  QUnit.test('CryptoAccount', function (assert) {

    let cryptoAccount;
    let lots;
    let withdrawLots;

    cryptoAccount = new CryptoAccount('BTC');
    lots = [];
    lots.push(new Lot(new Date(2020, 0, 2), 'USD', 0, 40000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 1), 'USD', 0, 20000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 3), 'USD', 0, 10000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 6), 'USD', 0, 30000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 4), 'USD', 0, 60000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 5), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));
    cryptoAccount.deposit(lots);
    withdrawLots = cryptoAccount.withdraw(1, 0, 'FIFO', 1);
    assert.equal(withdrawLots[0].costBasisSubunits, 2000000, 'withdraw FIFO');

    cryptoAccount = new CryptoAccount('BTC');
    lots = [];
    lots.push(new Lot(new Date(2020, 0, 2), 'USD', 0, 40000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 1), 'USD', 0, 20000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 3), 'USD', 0, 10000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 6), 'USD', 0, 30000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 4), 'USD', 0, 60000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 5), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));
    cryptoAccount.deposit(lots);
    withdrawLots = cryptoAccount.withdraw(1, 0, 'LIFO', 1);
    assert.equal(withdrawLots[0].costBasisSubunits, 3000000, 'withdraw LIFO');

    cryptoAccount = new CryptoAccount('BTC');
    lots = [];
    lots.push(new Lot(new Date(2020, 0, 2), 'USD', 0, 40000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 1), 'USD', 0, 20000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 3), 'USD', 0, 10000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 6), 'USD', 0, 30000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 4), 'USD', 0, 60000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 5), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));
    cryptoAccount.deposit(lots);
    withdrawLots = cryptoAccount.withdraw(1, 0, 'LOFO', 1);
    assert.equal(withdrawLots[0].costBasisSubunits, 1000000, 'withdraw LOFO');

    cryptoAccount = new CryptoAccount('BTC');
    lots = [];
    lots.push(new Lot(new Date(2020, 0, 2), 'USD', 0, 40000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 1), 'USD', 0, 20000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 3), 'USD', 0, 10000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 6), 'USD', 0, 30000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 4), 'USD', 0, 60000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 5), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));
    cryptoAccount.deposit(lots);
    withdrawLots = cryptoAccount.withdraw(1, 0, 'HIFO', 1);
    assert.equal(withdrawLots[0].costBasisSubunits, 6000000, 'withdraw HIFO');

    cryptoAccount = new CryptoAccount('BTC');
    cryptoAccount.deposit(new Lot(new Date(2020, 0, 1), 'USD', 0, 9900, 100, 'BTC', 1.0005, 0.0005, 'Kraken'));
    cryptoAccount.deposit(new Lot(new Date(2020, 0, 2), 'USD', 0, 19900, 100, 'BTC', 1.0005, 0.0005, 'Kraken'));
    assert.equal(cryptoAccount.subunits, 200000000, 'deposit subunits');
    assert.equal(cryptoAccount.balance, 2, 'deposit balance');

    cryptoAccount = new CryptoAccount('BTC');
    cryptoAccount.deposit(new Lot(new Date(2020, 0, 1), 'USD', 0, 9900, 100, 'BTC', 1.0005, 0.0005, 'Kraken'));
    cryptoAccount.deposit(new Lot(new Date(2020, 0, 2), 'USD', 0, 19900, 100, 'BTC', 1.0005, 0.0005, 'Kraken'));
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

    assert.equal(Currency.decimalDigits(''), 8, 'validDecimalDigits empty');
    assert.equal(Currency.decimalDigits('USD'), 2, 'validDecimalDigits USD');
    assert.equal(Currency.decimalDigits('JPY'), 0, 'validDecimalDigits JPY');
    assert.equal(Currency.decimalDigits('BTC'), 8, 'validDecimalDigits BTC');
    assert.equal(Currency.decimalDigits('ADA'), 6, 'validDecimalDigits ADA');

    assert.equal(Currency.subunits(''), 100000000, 'validDecimalDigits empty');
    assert.equal(Currency.subunits('USD'), 100, 'validDecimalDigits USD');
    assert.equal(Currency.subunits('JPY'), 1, 'validDecimalDigits JPY');
    assert.equal(Currency.subunits('BTC'), 100000000, 'validDecimalDigits BTC');
    assert.equal(Currency.subunits('ADA'), 1000000, 'validDecimalDigits ADA');

  });
}

function testCryptoTracker() {

  QUnit.test('CryptoTracker', function (assert) {

    let list = ['Bananas', 'Apples', 'Dates', 'Cherries'];
    list.sort(CryptoTracker.abcComparator);

    assert.equal(list[0], 'Apples', 'abcComparator');
    assert.equal(list[3], 'Dates', 'abcComparator');

    let integerArray;
    let resultsArray;

    integerArray = [3];
    resultsArray = CryptoTracker.apportionInteger(5, integerArray);
    assert.deepEqual(resultsArray, [5], 'Apportion Integer single item');

    integerArray = [3, 1, 5, 2, 4];
    resultsArray = CryptoTracker.apportionInteger(6, integerArray);
    assert.deepEqual(resultsArray, [1, 0, 2, 1, 2], 'Apportion Integer no adjust');

    integerArray = [3, 1, 5, 2, 4];
    resultsArray = CryptoTracker.apportionInteger(7, integerArray);
    assert.deepEqual(resultsArray, [1, 1, 2, 1, 2], 'Apportion integer adjust single add');

    integerArray = [3, 1, 5, 2, 4];
    resultsArray = CryptoTracker.apportionInteger(23, integerArray);
    assert.deepEqual(resultsArray, [5, 1, 8, 3, 6], 'Apportion Integer adjust single subtract');

    integerArray = [3, 18, 3, 3, 3, 3, 3];
    resultsArray = CryptoTracker.apportionInteger(16, integerArray);
    assert.deepEqual(resultsArray, [2, 8, 2, 1, 1, 1, 1], 'Apportion Integer adjust multiple add');

    integerArray = [3, 18, 3, 3, 3, 3, 3];
    resultsArray = CryptoTracker.apportionInteger(20, integerArray);
    assert.deepEqual(resultsArray, [1, 10, 1, 2, 2, 2, 2], 'Apportion Integer adjust multiple subtract');

    let cryptoTracker = new CryptoTracker();

    let lots = [];
    lots.push(new Lot(new Date(2020, 0, 1), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 2), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));

    cryptoTracker.donateLots(lots, new Date(2020, 0, 3), 2, 'Ledger');

    assert.deepEqual(cryptoTracker.donatedLots[0].lot, lots[0], 'cryptoTracker.donatedLots[0].lot');
    assert.equal(QUnit.equiv(cryptoTracker.donatedLots[0].date, new Date(2020, 0, 3)), true, 'donateLots donatedLots[0].date');
    assert.equal(cryptoTracker.donatedLots[0].exRate, 2, 'donateLots donatedLots[0].exRate');
    assert.equal(cryptoTracker.donatedLots[0].walletName, 'Ledger', 'donateLots donatedLots[0].walletName');

    assert.deepEqual(cryptoTracker.donatedLots[1].lot, lots[1], 'cryptoTracker.donatedLots[1].lot');
    assert.equal(QUnit.equiv(cryptoTracker.donatedLots[1].date, new Date(2020, 0, 3)), true, 'donateLots donatedLots[1].date');
    assert.equal(cryptoTracker.donatedLots[1].exRate, 2, 'donateLots donatedLots[1].exRate');
    assert.equal(cryptoTracker.donatedLots[1].walletName, 'Ledger', 'donateLots donatedLots[1].walletName');

    assert.equal(cryptoTracker.donatedLots.length, 2, 'donateLots donatedLots.length');

    cryptoTracker = new CryptoTracker();

    lots = [];
    lots.push(new Lot(new Date(2020, 0, 1), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));
    lots.push(new Lot(new Date(2020, 0, 2), 'USD', 0, 50000, 0, 'BTC', 1, 0, 'Kraken'));

    cryptoTracker.closeLots(lots, new Date(2020, 0, 3), 'EUR', 1.2, 140000, 100, 'Binance');

    assert.deepEqual(cryptoTracker.closedLots[0].lot, lots[0], 'cryptoTracker.closedLots[0].lot');
    assert.equal(QUnit.equiv(cryptoTracker.closedLots[0].date, new Date(2020, 0, 3)), true, 'closeLots closedLots[0].date');
    assert.equal(cryptoTracker.closedLots[0].creditCurrency, 'EUR', 'closeLots closedLots[0].creditCurrency');
    assert.equal(cryptoTracker.closedLots[0].creditExRate, 1.2, 'closeLots closedLots[0].creditExRate');
    assert.equal(cryptoTracker.closedLots[0].creditAmountSubunits, 7000000, 'closeLots closedLots[0].creditAmountSubunits');
    assert.equal(cryptoTracker.closedLots[0].creditFeeSubunits, 5000, 'closeLots closedLots[0].creditFeeSubunits');
    assert.equal(cryptoTracker.closedLots[0].walletName, 'Binance', 'closeLots walletName');

    assert.deepEqual(cryptoTracker.closedLots[1].lot, lots[1], 'cryptoTracker.closedLots[1].lot');
    assert.equal(QUnit.equiv(cryptoTracker.closedLots[1].date, new Date(2020, 0, 3)), true, 'closeLots closedLots[1].date');
    assert.equal(cryptoTracker.closedLots[1].creditCurrency, 'EUR', 'closeLots closedLots[1].creditCurrency');
    assert.equal(cryptoTracker.closedLots[1].creditExRate, 1.2, 'closeLots closedLots[1].creditExRate');
    assert.equal(cryptoTracker.closedLots[1].creditAmountSubunits, 7000000, 'closeLots closedLots[1].creditAmountSubunits');
    assert.equal(cryptoTracker.closedLots[1].creditFeeSubunits, 5000, 'closeLots closedLots[1].creditFeeSubunits');
    assert.equal(cryptoTracker.closedLots[1].walletName, 'Binance', 'closeLots walletName');
  });
}
