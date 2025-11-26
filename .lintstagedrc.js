const path = require('path');

module.exports = {
  'client/src/**/*.{js,jsx}': (filenames) => {
    const files = filenames.map(f => f.replace(/\\/g, '/'));
    return [
      `npx eslint --config ./client/eslint.config.js --fix ${files.join(' ')}`,
      `npx prettier --write ${files.join(' ')}`
    ];
  },
  'server/src/**/*.js': (filenames) => {
    const files = filenames.map(f => f.replace(/\\/g, '/'));
    return [
      `npx eslint --config ./server/eslint.config.js --fix ${files.join(' ')}`,
      `npx prettier --write ${files.join(' ')}`
    ];
  },
  '*.{json,md}': (filenames) => {
    const files = filenames.map(f => f.replace(/\\/g, '/'));
    return `npx prettier --write ${files.join(' ')}`;
  }
};
