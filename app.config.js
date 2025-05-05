module.exports = ({ config }) => {
  return {
    ...config,
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