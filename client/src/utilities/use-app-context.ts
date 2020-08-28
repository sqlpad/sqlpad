import useSWR from 'swr';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import baseUrl from './baseUrl.ts';

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
