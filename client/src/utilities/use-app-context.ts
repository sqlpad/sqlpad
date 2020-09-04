import useSWR from 'swr';
import baseUrl from './baseUrl';

function useAppContext() {
  let { data } = useSWR('api/app', { dedupingInterval: 60000 });

  const { config, currentUser, adminRegistrationOpen, version } = data || {};

  if (!config) {
    return {};
  }

  baseUrl(config.baseUrl);

  return { config, currentUser, adminRegistrationOpen, version };
}

export default useAppContext;
