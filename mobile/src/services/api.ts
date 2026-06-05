import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const api = axios.create({
  //baseURL: 'http://192.168.18.14:8001', // ap
  //baseURL: 'http://10.128.50.214:8001', //cel
  //baseURL: 'http://192.168.15.10:8001', //casa
  //baseURL: 'http://34.235.114.120:8001', //aws
  baseURL: 'http://192.168.0.182:8001', //casa nova
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

//sudo systemctl restart fastapi