/**
 * Cliente HTTP con axios que maneja automáticamente:
 * - Token JWT en headers
 * - Errores de red (dispara SERVER_DOWN)
 * - Errores 5xx (dispara SERVER_DOWN)
 * - Errores 401 (dispara SESSION_EXPIRED)
 * - Errores 400 (retorna la respuesta con errores de validación)
 */
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const serverMessage = 'No se puede conectar con el servidor. Por favor intenta nuevamente más tarde.';
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('SERVER_DOWN', { detail: { message: serverMessage } }));
      }
      error.handledGlobally = true;
      return Promise.reject(error);
    }

    if (error.response.status >= 500) {
      const serverMessage = error.response.data?.msg || 'El servidor está en mantenimiento. Intenta más tarde.';
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('SERVER_DOWN', { detail: { message: serverMessage } }));
      }
      error.handledGlobally = true;
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      const serverMessage = error.response.data?.msg || "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('SESSION_EXPIRED', { detail: { message: serverMessage } }));
      }
    }

    return Promise.reject(error);
  }
);

export const get = async <T>(url: string): Promise<T | undefined> => {
  try {
    const response = await apiClient.get<T>(url);
    return response.data;
  } catch (error: any) {
    if (error.handledGlobally) return undefined;
    return Promise.reject(error);
  }
};

export const post = async <T, B>(url: string, data: B): Promise<T | undefined> => {
  try {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  } catch (error: any) {
    if (error.handledGlobally) return undefined;
    if (error.response?.status === 400) return error.response.data;
    return Promise.reject(error);
  }
};

export const postWithAuth = async <T, B>(url: string, data: B): Promise<T | undefined> => {
  try {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  } catch (error: any) {
    if (error.handledGlobally) return undefined;
    if (error.response) return error.response.data;
    throw error;
  }
};

export const put = async <T, B>(url: string, data: B): Promise<T | undefined> => {
  try {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  } catch (error: any) {
    if (error.handledGlobally) return undefined;
    if (error.response?.status === 400) return error.response.data;
    return Promise.reject(error);
  }
};

export const del = async <T>(url: string): Promise<T | undefined> => {
  try {
    const response = await apiClient.delete<T>(url);
    return response.data;
  } catch (error: any) {
    if (error.handledGlobally) return undefined;
    return Promise.reject(error);
  }
};
