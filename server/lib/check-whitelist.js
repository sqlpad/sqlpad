/*  Set and check whitelisted email domains so that users with the appropriate
 emails do not have to explicitly be invited.

 This checks the whitelisted domains config, which is a string of space
 delimited domains.

 Example: "baz.com foo.bar.com" will allow anyone with a @baz.com or @foo.bar.com
 email to sign up. The domains and subdomains must match exactly (i.e. someone
 with a @bar.com or @123.baz.com would not be able to sign up.)
============================================================================= */

/**
 * Test either email matches whitelisted domain
 * @param {string} whitelistedDomains whitelistedDomains from config. space separated values
 * @param {string} email
 * @returns {boolean}
 */
module.exports = function checkWhitelist(whitelistedDomains, email) {
  if (whitelistedDomains) {
    const domain = email.split('@')[1]
    const whitelistDomains = whitelistedDomains
      .split(' ')
      .map(domain => domain.trim())

    return whitelistDomains.includes(domain)
  }
  return false
}
