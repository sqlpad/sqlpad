// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/parse-link-header` if it e... Remove this comment to see the full error message
import parseLinkHeader from 'parse-link-header';
import 'whatwg-fetch';
import message from '../common/message';
import baseUrl from './baseUrl';

export default async function fetchJson(method: any, url: any, body: any) {
  const BASE_URL = baseUrl();
  const opts = {
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ method: ... Remove this comment to see the full error message
    opts.body = JSON.stringify(body);
  }

  let fetchUrl = BASE_URL + url;
  if (BASE_URL && url.substring(0, 1) !== '/') {
    fetchUrl = BASE_URL + '/' + url;
  }

  let response;
  try {
    // @ts-expect-error ts-migrate(2345) FIXME: Type 'string' is not assignable to type '"same-ori... Remove this comment to see the full error message
    response = await fetch(fetchUrl, opts);
    if (response.redirected) {
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'Location'... Remove this comment to see the full error message
      window.location = response.url;
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
      return { data: json, links };
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
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    return fetchJson('DELETE', url);
  },
  post(url: any, body: any) {
    return fetchJson('POST', url, body);
  },
  get(url: any) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    return fetchJson('GET', url);
  },
};
