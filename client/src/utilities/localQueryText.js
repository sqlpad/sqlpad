import localforage from 'localforage';

export function setLocalQueryText(queryId, queryText) {
  return localforage
    .setItem(`queryText:${queryId}`, queryText)
    .catch((error) => console.error(error));
}

export function getLocalQueryText(queryId) {
  return localforage
    .getItem(`queryText:${queryId}`)
    .catch((error) => console.error(error));
}

export function removeLocalQueryText(queryId) {
  return localforage
    .removeItem(`queryText:${queryId}`)
    .catch((error) => console.error(error));
}

export default {
  setLocalQueryText,
  getLocalQueryText,
  removeLocalQueryText,
};
