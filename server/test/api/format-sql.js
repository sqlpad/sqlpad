const assert = require('assert');
const utils = require('../utils');

describe('api/format-sql', function() {
  before(function() {
    return utils.resetWithUser();
  });

  it('format sql query', function() {
    return utils
      .post('admin', '/api/format-sql', {
        query: 'SELECT column_one, column_two FROM sometable'
      })
      .then(body => {
        console.log(body);
        assert.equal(
          body.query,
          'SELECT\n  column_one,\n  column_two\nFROM\n  sometable'
        );
        assert(!body.error, 'Expect no error');
      });
  });
});
