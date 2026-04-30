module.exports = {
  'client/src/**/*.{js,jsx}': (filenames) => {
    const files = filenames.map(f => f.replace(/\\/g, '/'));
    return [
      `npm --prefix client exec eslint -- --fix --config client/eslint.config.js ${files.join(' ')}`,
      `npm --prefix client exec prettier -- --write ${files.join(' ')}`
    ];
  },
  'server/src/**/*.js': (filenames) => {
    const files = filenames.map(f => f.replace(/\\/g, '/'));
    return [
      `npm --prefix server exec eslint -- --fix --config server/eslint.config.js ${files.join(' ')}`,
      `npm --prefix server exec prettier -- --write ${files.join(' ')}`
    ];
  }
};
