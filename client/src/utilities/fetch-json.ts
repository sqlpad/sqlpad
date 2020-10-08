import parseLinkHeader from 'parse-link-header';
import useSWR, { mutate } from 'swr';
import 'whatwg-fetch';
import message from '../common/message';
import {
  Connection,
  ConnectionAccess,
  Query,
  ServiceToken,
  User,
} from '../types';
import baseUrl from './baseUrl';

interface FetchResponse<DataT> {
  data?: DataT;
  error?: string;
  links?: parseLinkHeader.Links;
}

export default async function fetchJson<DataT = any>(
  method: any,
  url: any,
  body?: any
): Promise<FetchResponse<DataT>> {
  const BASE_URL = baseUrl();
  const opts: RequestInit = {
    method: method.toUpperCase(),
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Expires: '-1',
      Pragma: 'no-cache',
    },
  };
  if (body) {
    opts.body = JSON.stringify(body);
  }

  let fetchUrl = BASE_URL + url;
  if (BASE_URL && url.substring(0, 1) !== '/') {
    fetchUrl = BASE_URL + '/' + url;
  }

  let response: Response;
  try {
    response = await fetch(fetchUrl, opts);
    if (response.redirected) {
      window.location.href = response.url;
      return {};
    }
  } catch (error) {
    const title = 'Network error';
    message.error(title);
    return {
      error: title,
    };
  }

  try {
    const json = await response.json();

    let link = response.headers.get('Link');
    const links = link && parseLinkHeader(link);

    // New v5 API format the body is the data or error
    // Which is what depends on status code. 2xx is data, 4xx or 5xx is error
    // If 200-299 the body is data
    if (response.ok) {
      const data: DataT = json;
      return { data, links: links ? links : undefined };
    }

    // The body is an error object with a .title at a minimum, possibly .detail and other props
    // To ease transition, we'll convert the error object into an error string for now
    // At some point front-end can be updated to handle error object
    return { error: json.detail || json.title || '' };
  } catch (error) {
    // An error parsing JSON. This is unexepected, log to console
    // Send a more generic message in response
    console.error(response);
    return {
      error: 'Server responded not ok',
    };
  }
}

export const api = {
  put(url: any, body: any) {
    return fetchJson('PUT', url, body);
  },

  delete(url: any) {
    return fetchJson('DELETE', url);
  },

  post(url: any, body: any) {
    return fetchJson('POST', url, body);
  },

  get<DataT = any>(url: any) {
    return fetchJson<DataT>('GET', url);
  },

  async getQueries() {
    return this.get<Query[]>('/queries');
  },

  reloadQueries() {
    return mutate('/api/queries');
  },

  useConnections() {
    return useSWR<Connection[]>('/api/connections');
  },

  reloadConnections() {
    return mutate('/api/connections');
  },

  useUsers() {
    return useSWR<User[]>('/api/users');
  },

  useConnectionAccesses(includeInactives?: boolean) {
    let url = `/api/connection-accesses`;
    if (includeInactives) {
      url = url + '?includeInactives=true';
    }
    return useSWR<ConnectionAccess[]>(url);
  },

  useDrivers() {
    return useSWR('/api/drivers');
  },

  /**
   * Tags are conditionally fetched.
   * Since hooks can not be used conditionally,
   * a null must be passed to useSWR to signal not to fetch.
   * This feels strange and inconsistent.
   * Should all api.use* follow same pattern?
   * @param shouldFetch
   */
  useTags(shouldFetch?: boolean) {
    return useSWR<string[]>(shouldFetch ? '/api/tags' : null);
  },

  useServiceTokens() {
    return useSWR<ServiceToken[]>('/api/service-tokens');
  },

  useUser(id: string) {
    return useSWR<User>(`/api/users/${id}`);
  },

  userUpdated(userId?: string) {
    mutate('api/users');
    if (userId) {
      mutate(`/api/users/${userId}`);
    }
  },

  useAppInfo() {
    return useSWR('api/app', { dedupingInterval: 60000 });
  },

  reloadAppInfo() {
    return mutate('api/app');
  },

  /**
   *
   * @param filter comma delimited list of filter strings in format field|operator|value
   */
  useQueryHistory(filter?: string) {
    return useSWR(`/api/query-history?filter=${filter}`);
  },
};
