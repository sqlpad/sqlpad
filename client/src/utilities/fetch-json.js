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
      error: title
    };
  }

  try {
    const json = await response.json();

    // New v5 API format the body is the data or error
    // Which is what depends on status code. 2xx is data, 4xx or 5xx is error
    // If 200-299 the body is data
    if (response.ok) {
      return { data: json };
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
      error: 'Server responded not ok'
    };
  }
}
