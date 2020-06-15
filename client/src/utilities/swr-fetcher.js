import { api } from './fetch-json';

export default async function swrFetcher(url) {
  const { data, error } = await api.get(url);
  if (error) {
    throw error;
  }
  return data;
}
