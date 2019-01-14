const base = require('./jest.base');
module.exports = {
  ...base,
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.base.json',
    },
  },
};
