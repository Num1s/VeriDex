// Jest setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test utilities
global.testConfig = {
  timeout: 10000,
  retries: 3,
};

// Mock console methods for cleaner test output
global.mockConsole = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  global.mockConsole.log.mockRestore();
  global.mockConsole.error.mockRestore();
  global.mockConsole.warn.mockRestore();
});
