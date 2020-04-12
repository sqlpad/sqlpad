import 'whatwg-fetch';
import message from '../common/message';

export default async function fetchJson(method, url, body) {
  const BASE_URL = window.BASE_URL || '';
  const opts = {
    method: method.toUpperCase(),
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Expires: '-1',
      Pragma: 'no-cache'
    }
  };
  if (body) {
    opts.body = JSON.stringify(body);
  }

  let fetchUrl = BASE_URL + url;
  if (BASE_URL && url.substring(0, 1) !== '/') {
    fetchUrl = BASE_URL + '/' + url;
  }

  let response;
  try {
    response = await fetch(fetchUrl, opts);
    if (response.redirected) {
      window.location = response.url;
      return {};
    }
  } catch (error) {
    const title = 'Network error';
    message.error(title);
    return {
      errors: [{ title }],
      error: title
    };
  }

  try {
    const json = await response.json();

    // New v5 API format sends { data } or { errors }
    // If errors is sent, also decorate with `error` prop that is a string similar to legacy implementation
    // This is to ease the transition on front-end, and can be removed later at some point
    if (json.errors) {
      const error = json.errors[0] || {};
      json.error = error.detail || error.title || '';
    }

    return json;
  } catch (error) {
    // An error parsing JSON. This is unexepected, log to console
    // Send a more generic message in response
    console.error(response);
    const title = 'Server responded not ok';
    return {
      errors: [{ title }],
      error: title
    };
  }
}
