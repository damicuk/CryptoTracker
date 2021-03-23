function testFiatAccount() {

  QUnit.test("fiat account", function (assert) {
    let fiatAccount = new FiatAccount();
    assert.equal(fiatAccount.balance, 0, "initial balance 0");
    fiatAccount.transfer(1.03);
    assert.equal(fiatAccount.balance, 1.03, "transfer + whole cents");
    fiatAccount.transfer(0.004);
    assert.equal(fiatAccount.balance, 1.03, "transfer +0.004 cents");
    fiatAccount.transfer(0.005);
    assert.equal(fiatAccount.balance, 1.04, "transfer +0.005 cents");
    fiatAccount.transfer(-0.01);
    assert.equal(fiatAccount.balance, 1.03, "transfer - whole cents");
    fiatAccount.transfer(-0.005);
    assert.equal(fiatAccount.balance, 1.03, "transfer -0.005 cents");
    fiatAccount.transfer(-0.006);
    assert.equal(fiatAccount.balance, 1.02, "transfer -0.006 cents");
    fiatAccount.transfer(-2);
    assert.equal(fiatAccount.balance, -0.98, "negative balance");
  });

}
