module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...(config.android || {}),
      edgeToEdgeEnabled: true,
    },
    plugins: [
      "expo-secure-store",
      "react-native-edge-to-edge"
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