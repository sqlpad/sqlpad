import message from '../common/message';
import fetchJson from '../utilities/fetch-json.js';

export const initialState = {
  availableTags: []
};

export const loadTags = async state => {
  const { error, data } = await fetchJson('GET', '/api/tags');
  if (error) {
    message.error(error);
  }
  return { availableTags: data };
};

export default { initialState, loadTags };
