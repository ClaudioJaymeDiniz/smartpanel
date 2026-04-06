// jest.config.js
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./test/setup.ts'],
  clearMocks: true,
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleNameMapper: {
    // O segredo está no 'src/$1' para ele entrar na pasta correta
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
};