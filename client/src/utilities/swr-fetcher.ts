import { api } from './api';

export default async function swrFetcher(url: any) {
  const { data, error } = await api.get(url);
  if (error) {
    throw error;
  }
  return data;
}
