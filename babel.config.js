/*
module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  // Seus outros plugins
  plugins.push('react-native-worklets/plugin');
  
  // O Reanimated DEVE ser o último
  plugins.push('react-native-reanimated/plugin');

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};*/

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Se houver outras linhas de plugins aqui, mantenha-as, 
      // mas o reanimated DEVE ser sempre a última.
      'react-native-reanimated/plugin', 
    ],
  };
};