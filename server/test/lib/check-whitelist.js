const assert = require('assert');
const checkWhitelist = require('../../lib/check-whitelist');

describe('lib/check-whitelist', function() {
  it('allows email addresses matching any domain in the list', function() {
    const whitelistedDomains = 'baz.com foo.bar.com';
    assert(checkWhitelist(whitelistedDomains, 'user@baz.com'));
    assert(checkWhitelist(whitelistedDomains, 'user@foo.bar.com'));
  });

  it('disallows email addresses that do not match domains exactly', function() {
    const whitelistedDomains = 'baz.com foo.bar.com';
    assert.equal(checkWhitelist(whitelistedDomains, 'user@bar.com'), false);
    assert.equal(checkWhitelist(whitelistedDomains, 'user@123.baz.com'), false);
  });

  it('uses the last @ segment as the domain', function() {
    const whitelistedDomains = 'baz.com';
    assert.equal(
      // Email addresses are allowed to contain multiple @ signs, as long as all
      // of the @'s in the local part of the email address are enclosed in
      // quotes. We need to make sure that we only treat the last @-delimited as
      // the domain.
      checkWhitelist(whitelistedDomains, '"user@baz.com@"@not-whitelisted.com'),
      false
    );
  });
});
