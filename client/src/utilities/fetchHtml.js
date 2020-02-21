import 'whatwg-fetch';
import message from '../common/message';

export default function fetchHtml(url) {
  const BASE_URL = window.BASE_URL || '';
  const opts = {
    method: 'GET',
    credentials: 'same-origin'
  };

  let fetchUrl = BASE_URL + url;
  if (BASE_URL && url.substring(0, 1) !== '/') {
    fetchUrl = BASE_URL + '/' + url;
  }

  return fetch(fetchUrl, opts)
    .then(response => {
      if (response.redirected) {
        return (window.location = response.url);
      } else if (response.status === 200) {
        return response.text();
      } else {
        console.error(response);
        throw new Error('Server responded not ok');
      }
    })
    .catch(error => {
      message.error(error.toString());
    });
}
