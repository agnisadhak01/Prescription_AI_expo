module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      "expo-secure-store"
    ],
    hooks: {
      postPublish: [
        {
          file: 'eas-hooks/disable-auto-submit.js',
          config: {}
        }
      ]
    }
  };
}; 