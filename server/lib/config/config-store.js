let _config;

/**
 *
 * @param {import('../config').default} config
 */
export function setConfigRef(config) {
  _config = config;
}

/**
 *
 * @returns {import('../config').default | undefined} config
 */
export function getConfigRef() {
  return _config;
}
