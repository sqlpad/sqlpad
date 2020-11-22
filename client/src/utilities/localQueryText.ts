import localforage from 'localforage';

export function setLocalQueryText(queryId: any, queryText: any) {
  return localforage
    .setItem(`queryText:${queryId}`, queryText)
    .catch((error) => console.error(error));
}

export function getLocalQueryText(queryId: any) {
  return localforage
    .getItem(`queryText:${queryId}`)
    .catch((error) => console.error(error));
}

export function removeLocalQueryText(queryId: any) {
  return localforage
    .removeItem(`queryText:${queryId}`)
    .catch((error) => console.error(error));
}

const localQueryText = {
  setLocalQueryText,
  getLocalQueryText,
  removeLocalQueryText,
};

export default localQueryText;
