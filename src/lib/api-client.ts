// API Client utility for frontend
const BASE_URL = "/api"

interface ApiOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  params?: Record<string, string>
}

export async function apiClient<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, params } = options

  let url = `${BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  }

  if (body && method !== "GET") {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || `API Error: ${response.status}`)
  }

  return response.json()
}

// Typed API methods
export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, string>) =>
    apiClient<T>(endpoint, { method: "GET", params }),

  post: <T = any>(endpoint: string, body: any) =>
    apiClient<T>(endpoint, { method: "POST", body }),

  put: <T = any>(endpoint: string, body: any) =>
    apiClient<T>(endpoint, { method: "PUT", body }),

  patch: <T = any>(endpoint: string, body: any) =>
    apiClient<T>(endpoint, { method: "PATCH", body }),

  delete: <T = any>(endpoint: string) =>
    apiClient<T>(endpoint, { method: "DELETE" }),
}
