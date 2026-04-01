import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const api = axios.create({
  // Verifique seu IP com 'hostname -I' no terminal do Mint
  baseURL: 'http://192.168.137.140:8001', 
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