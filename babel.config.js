module.exports = (api) => {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
    plugins: [
      // Reanimated v4: worklets plugin moved to `react-native-worklets`.
      // MUST be last.
      'react-native-worklets/plugin',
    ],
  };
};
