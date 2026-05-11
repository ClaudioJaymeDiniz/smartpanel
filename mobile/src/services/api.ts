import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const api = axios.create({
  baseURL: 'http://192.168.18.14:8001',
  //baseURL: 'http://10.111.229.213:8001', 
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