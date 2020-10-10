import baseUrl from './baseUrl';
import { api } from './api';

function useAppContext() {
  let { data } = api.useAppInfo();

  const { config, currentUser, adminRegistrationOpen, version } = data || {};

  if (!config) {
    return {};
  }

  baseUrl(config.baseUrl);

  return { config, currentUser, adminRegistrationOpen, version };
}

export default useAppContext;
