import useSWR, { mutate } from 'swr';
import 'whatwg-fetch';
import message from '../common/message';
import {
  AppInfo,
  Batch,
  BatchHistoryItem,
  Connection,
  ConnectionAccess,
  ConnectionDetail,
  ConnectionSchema,
  Driver,
  Query,
  QueryDetail,
  QueryHistoryResponse,
  ServiceToken,
  StatementResults,
  User,
  UserSelfUpdate,
} from '../types';
import { Links, parseLinkHeader } from '../utilities/parse-link-header';
import { apiBaseUrl } from './baseUrl';
import swrFetcher from './swr-fetcher';

interface FetchResponse<DataT> {
  data?: DataT;
  error?: string;
  links?: Links;
}

async function fetchJson<DataT = any>(
  method: any,
  url: any,
  body?: any
): Promise<FetchResponse<DataT>> {
  const BASE_URL = apiBaseUrl();
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
  put<DataT = any>(url: any, body: any) {
    return fetchJson<DataT>('PUT', url, body);
  },

  delete(url: any) {
    return fetchJson('DELETE', url);
  },

  post<DataT = any>(url: any, body: any) {
    return fetchJson<DataT>('POST', url, body);
  },

  get<DataT = any>(url: any) {
    return fetchJson<DataT>('GET', url);
  },

  async signout(userEmail: any) {
    await this.get(`/api/signout/${userEmail}`);
    return mutate('api/app');
  },

  createBatch(data: Partial<Batch>) {
    return this.post<Batch>('/api/batches', data);
  },

  getBatch(batchId: string) {
    return this.get<Batch>(`/api/batches/${batchId}`);
  },

  cancelBatch(batchId: string, putData: any) {
    return this.put(`/api/batches/${batchId}/cancel`, putData);
  },

  useBatch(batchId: string) {
    return useSWR<Batch>(`/api/batches/${batchId}`);
  },

  useQueryBatchHistory(queryId: string) {
    return useSWR<BatchHistoryItem[]>(
      `/api/batches?queryId=${queryId}&includeStatements=true`
    );
  },

  getStatementResults(statementId: string) {
    return this.get<StatementResults>(`/api/statements/${statementId}/results`);
  },

  /**
   * Get statement results, but only if statement is finished
   * This is important because these gets are deduped/cached
   * @param statementId
   * @param status
   */
  useStatementResults(statementId?: string, status?: string) {
    const url =
      statementId && status === 'finished'
        ? `/api/statements/${statementId}/results`
        : null;
    return useSWR<StatementResults>(url, {
      dedupingInterval: 60000,
    });
  },

  getQueries() {
    return this.get<Query[]>('/api/queries');
  },

  useQuery(queryId?: string) {
    return useSWR<QueryDetail>(queryId ? `/api/queries/${queryId}` : null);
  },

  getQuery(queryId: string) {
    return this.get<QueryDetail>(`/api/queries/${queryId}`);
  },

  async createQuery(body: any) {
    const query = await this.post<QueryDetail>(`/api/queries`, body);
    mutate('/api/queries');
    return query;
  },

  async updateQuery(queryId: string, body: any) {
    const query = await this.put<QueryDetail>(`/api/queries/${queryId}`, body);
    mutate(`/api/queries`);
    mutate(`/api/queries/${queryId}`);
    return query;
  },

  deleteQuery(queryId: string) {
    return api.delete(`/api/queries/${queryId}`);
  },

  useConnections() {
    return useSWR<Connection[]>('/api/connections', {
      dedupingInterval: 60000,
    });
  },

  reloadConnections() {
    return mutate('/api/connections');
  },

  getConnection(connectionId: string) {
    return this.get<ConnectionDetail>(`/api/connections/${connectionId}`);
  },

  getConnections() {
    return this.get<Connection[]>('/api/connections');
  },

  deleteConnection(connectionId: string) {
    return api.delete(`/api/connections/${connectionId}`);
  },

  getConnectionSchema(connectionId: string, reload?: boolean) {
    const qs = reload ? '?reload=true' : '';
    return api.get<ConnectionSchema>(
      `/api/connections/${connectionId}/schema${qs}`
    );
  },

  useConnectionSchema(connectionId: string, reload?: boolean) {
    const qs = reload ? '?reload=true' : '';
    return useSWR<ConnectionSchema>(
      `/api/connections/${connectionId}/schema${qs}`
    );
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
    return useSWR<Driver[]>('/api/drivers');
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

  deleteServiceToken(serviceTokenId: string) {
    return this.delete(`/api/service-tokens/${serviceTokenId}`);
  },

  async updateUser(id: string, body: UserSelfUpdate) {
    const response = await this.put<User>(`/api/users/${id}`, body);
    mutate(`/api/users/${id}`);
    // This API is used for self-updates so reload app-context
    mutate('api/app');
    return response;
  },

  useUser(id: string) {
    return useSWR<User>(`/api/users/${id}`);
  },

  deleteUser(userId: string) {
    return this.delete(`/api/users/${userId}`);
  },

  /**
   * Send signal to SWR to reload user fetches
   * @param userId user updated
   */
  reloadUsers(userId?: string) {
    mutate('api/users');
    if (userId) {
      mutate(`/api/users/${userId}`);
    }
  },

  useAppInfo() {
    const apiBaseUrlOverride = import.meta.env.VITE_API_BASE_URL_OVERRIDE;
    if (apiBaseUrlOverride) {
      apiBaseUrl(import.meta.env.VITE_API_BASE_URL_OVERRIDE);
    }

    return useSWR<AppInfo>('api/app', {
      dedupingInterval: 60000,
      fetcher: async (url: any) => {
        const fetched = (await swrFetcher(url)) as AppInfo;
        return {
          ...fetched,
          config: {
            ...fetched.config,
            baseUrl:
              import.meta.env.VITE_SPA_BASE_URL_OVERRIDE ||
              fetched.config.baseUrl,
          },
        };
      },
    });
  },

  reloadAppInfo() {
    return mutate('api/app');
  },

  /**
   *
   * @param filter comma delimited list of filter strings in format field|operator|value
   */
  useQueryHistory(filter?: string) {
    return useSWR<QueryHistoryResponse>(`/api/query-history?filter=${filter}`);
  },
};
