let _baseUrl = '';

/**
 * Sets and/or gets the base URL of the frontend single-page app
 */
export default function baseUrl(value?: string) {
  if (typeof value === 'string') {
    _baseUrl = value;
  }
  return _baseUrl;
}

let _apiBaseUrl: string | undefined = undefined;

/**
 * Sets and/or gets the base URL of the backend API.
 * If unset, defaults to Single-Page App base URL.
 */
export function apiBaseUrl(value?: string) {
  if (typeof value === 'string') {
    _apiBaseUrl = value;
  }
  return _apiBaseUrl == undefined ? _baseUrl : _apiBaseUrl;
}
