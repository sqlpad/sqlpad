import axiosInstance from "../utils/axios"

export async function get<T>(path: string): Promise<T> {
  const { data } = await axiosInstance.get(path)
  return data
}

export async function post<T, R>(postData: T, path: string): Promise<R> {
  return await axiosInstance
    .post<R>(path, postData, { withCredentials: true })
    .then(({ data }) => {
      return data
    })
    .catch((err) => {
      throw err
    })
}
