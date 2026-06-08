import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const AWS_URL = process.env.EXPO_PUBLIC_API_URL || 'http://44.219.57.158';
const LOCAL_URL = 'http://10.128.50.214:8001';

const normalizeUrl = (url: string) => url.replace(/\/+$/, '');

const apiCandidates = [normalizeUrl(AWS_URL), normalizeUrl(LOCAL_URL)];

export const api = axios.create({
  baseURL: apiCandidates[0],
  timeout: 15000,
});

let routeInitialized = false;
let routeInitializationPromise: Promise<void> | null = null;

async function canReachApi(url: string): Promise<boolean> {
  try {
    await axios.get(`${url}/docs`, {
      timeout: 5000,
      validateStatus: () => true,
    });
    return true;
  } catch {
    return false;
  }
}

async function initializeApiRoute(): Promise<void> {
  if (routeInitialized) return;
  if (routeInitializationPromise) return routeInitializationPromise;

  routeInitializationPromise = (async () => {
    for (const url of apiCandidates) {
      const isOnline = await canReachApi(url);
      if (isOnline) {
        api.defaults.baseURL = url;
        console.log('[SmartPanel] API configurada para:', url);
        routeInitialized = true;
        return;
      }
    }

    api.defaults.baseURL = apiCandidates[0];
    routeInitialized = true;
    console.log('[SmartPanel] Nenhum servidor respondeu. Mantendo:', apiCandidates[0]);
  })();

  return routeInitializationPromise;
}

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    await initializeApiRoute();

    const token = await SecureStore.getItemAsync('user_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
