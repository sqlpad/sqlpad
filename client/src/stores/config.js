import fetchJson from '../utilities/fetch-json.js';

export const refreshAppContext = async () => {
  const {
    config,
    currentUser,
    adminRegistrationOpen,
    version
  } = await fetchJson('GET', 'api/app');
  if (!config) {
    return;
  }
  // Assign config.baseUrl to global
  // It doesn't change and is needed for fetch requests
  // This allows us to simplify the fetch() call
  window.BASE_URL = config.baseUrl;

  return {
    config,
    currentUser,
    adminRegistrationOpen,
    version
  };
};

export default { refreshAppContext };
