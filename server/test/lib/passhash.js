import assert from 'assert';
import passhash from '../../lib/passhash.js';

describe('lib/passhash', function () {
  const password = 'This is a p@ssw0rd like!';
  let hash;

  it('hashes password', async function () {
    const password = 'This is a p@ssw0rd like!';
    hash = await passhash.getPasshash(password);
  });

  it('correctly compares password to hash', async function () {
    const matches = await passhash.comparePassword(password, hash);
    assert.equal(matches, true, 'password matches');
  });
});
