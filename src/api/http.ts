import { fetchWrapper } from "@/utils/helpers/fetch-wrapper";

export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiUrl = (path:string)=>`${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`

export const http = {
  get: (path: string) => fetchWrapper.get(apiUrl(path)),
  post: (path: string, body?: any) => fetchWrapper.post(apiUrl(path), body),
  put: (path: string, body?: any) => fetchWrapper.put(apiUrl(path), body),
  delete: (path: string) => fetchWrapper.delete(apiUrl(path)),
};