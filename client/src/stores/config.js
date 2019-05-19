import fetchJson from '../utilities/fetch-json.js';

export const refreshAppContext = async () => {
  const json = await fetchJson('GET', 'api/app');
  if (!json.config) {
    return;
  }
  // Assign config.baseUrl to global
  // It doesn't change and is needed for fetch requests
  // This allows us to simplify the fetch() call
  window.BASE_URL = json.config.baseUrl;

  return {
    config: json.config,
    smtpConfigured: json.smtpConfigured,
    googleAuthConfigured: json.googleAuthConfigured,
    currentUser: json.currentUser,
    passport: json.passport,
    adminRegistrationOpen: json.adminRegistrationOpen,
    version: json.version
  };
};

export default { refreshAppContext };
