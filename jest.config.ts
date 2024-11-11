module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testMatch: ['**/test/**/*.spec.ts', '**/?(*.)+(spec|test).ts'],
};
