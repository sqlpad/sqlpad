/*  Set and check allowed email domains so that users with the appropriate
 emails do not have to explicitly be invited.

 This checks the allowed domains config, which is a string of space
 delimited domains.

 Example: "baz.com foo.bar.com" will allow anyone with a @baz.com or @foo.bar.com
 email to sign up. The domains and subdomains must match exactly (i.e. someone
 with a @bar.com or @123.baz.com would not be able to sign up.)
============================================================================= */

/**
 * Test either email matches allowed domain
 * @param {string} allowedDomains allowed domains from config. space separated values
 * @param {string} email
 * @returns {boolean}
 */
module.exports = function checkAllowedDomains(allowedDomains, email) {
  if (allowedDomains) {
    const domain = email.split('@').pop();
    const domains = allowedDomains.split(' ').map((domain) => domain.trim());

    return domains.includes(domain);
  }
  return false;
};
