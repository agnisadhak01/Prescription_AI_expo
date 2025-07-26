module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...(config.android || {}),
      edgeToEdgeEnabled: true,
    },
    plugins: [
      "expo-secure-store",
      "react-native-edge-to-edge",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
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