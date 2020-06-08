import fetchJson from './fetch-json';

export default async function swrFetcher(url) {
  const { data, links, error } = await fetchJson('GET', url);
  if (error) {
    throw error;
  }
  return { data, links };
}
