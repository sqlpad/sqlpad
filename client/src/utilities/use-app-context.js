import useSWR from 'swr';

function useAppContext() {
  let { data } = useSWR('api/app', { dedupingInterval: 60000 });

  const { config, currentUser, adminRegistrationOpen, version } = data || {};

  if (!config) {
    return {};
  }

  // Assign config.baseUrl to global
  // It doesn't change and is needed for fetch requests
  // This allows us to simplify the fetch() call
  window.BASE_URL = config.baseUrl;

  return { config, currentUser, adminRegistrationOpen, version };
}

export default useAppContext;
