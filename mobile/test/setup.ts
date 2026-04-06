import * as SecureStore from 'expo-secure-store';

// Criamos uma variável local para simular o armazenamento do celular
let storage: { [key: string]: string } = {};

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn((key, value) => {
    storage[key] = value;
    return Promise.resolve();
  }),
  getItemAsync: jest.fn((key) => {
    return Promise.resolve(storage[key] || null);
  }),
  deleteItemAsync: jest.fn((key) => {
    delete storage[key];
    return Promise.resolve();
  }),
}));