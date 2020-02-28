const consts = require('./consts');

// Not sure where to put utilities like these

/**
 * Returns a decorated query object with canRead, canWrite, and canDelete properties
 * @param {object} query
 * @param {object} user
 */
function decorateQueryUserAccess(query, user) {
  const { ...clone } = query;
  clone.canRead = false;
  clone.canWrite = false;
  clone.canDelete = false;

  if (user.role === 'admin' || user.email === clone.createdBy) {
    clone.canRead = true;
    clone.canWrite = true;
    clone.canDelete = true;
  } else if (clone.acl.length) {
    const writeAcl = clone.acl.find(a => a.write === true);
    clone.canWrite = Boolean(writeAcl);

    const canRead = query.acl.find(
      acl =>
        acl.groupId === consts.EVERYONE_ID ||
        acl.userId === user._id ||
        acl.userEmail === user.email
    );
    clone.canRead = Boolean(canRead);
  }

  return clone;
}

module.exports = decorateQueryUserAccess;
