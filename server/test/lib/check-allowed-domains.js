const assert = require('assert');
const checkAllowedDomains = require('../../lib/check-allowed-domains');

describe('lib/check-allowed-domains', function () {
  it('allows email addresses matching any domain in the list', function () {
    const allowedDomains = 'baz.com foo.bar.com';
    assert(checkAllowedDomains(allowedDomains, 'user@baz.com'));
    assert(checkAllowedDomains(allowedDomains, 'user@foo.bar.com'));
  });

  it('disallows email addresses that do not match domains exactly', function () {
    const allowedDomains = 'baz.com foo.bar.com';
    assert.equal(checkAllowedDomains(allowedDomains, 'user@bar.com'), false);
    assert.equal(
      checkAllowedDomains(allowedDomains, 'user@123.baz.com'),
      false
    );
  });

  it('uses the last @ segment as the domain', function () {
    const allowedDomains = 'baz.com';
    assert.equal(
      // Email addresses are allowed to contain multiple @ signs, as long as all
      // of the @'s in the local part of the email address are enclosed in
      // quotes. We need to make sure that we only treat the last @-delimited as
      // the domain.
      checkAllowedDomains(allowedDomains, '"user@baz.com@"@not-allowed.com'),
      false
    );
  });
});
