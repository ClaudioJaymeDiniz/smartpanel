{/*import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const api = axios.create({
  // Verifique seu IP com 'hostname -I' no terminal do Mint
  baseURL: 'http://192.168.0.182:8001', 
  //baseURL: 'http://192.168.18.14:8001',
  adapter: process.env.NODE_ENV === 'test' ? 'http' : undefined,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('user_token');
    
    // Verificação de segurança para o TypeScript
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
*/}
import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const api = axios.create({
  baseURL: 'http://192.168.18.14:8001',
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('user_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);