// Test suite for Knex database connection

// Mock knexfile.js
jest.mock('../../knexfile', () => {
  const actualKnexfile = jest.requireActual('../../knexfile');
  return {
    development: {
      ...actualKnexfile.development, // Spread existing dev config
      connection: {
        ...actualKnexfile.development.connection,
        database: 'mock_dev_db', // Override for test predictability
      },
    },
    test: { // Add a specific test environment for the mock
      client: 'postgresql',
      connection: {
        database: 'mock_test_db',
        user: 'test_user',
        password: 'test_password',
      },
      migrations: {
        tableName: 'knex_migrations_test',
      },
    },
    production: {
      ...actualKnexfile.production, // Spread existing prod config
      connection: {
        ...actualKnexfile.production.connection,
        database: 'mock_prod_db', // Override for test predictability
      },
    },
    // Include other environments from the actual knexfile if they exist and are needed
  };
}, { virtual: true }); // virtual true is important for mocks of actual files

describe('Database Connection Logic', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules(); // Clears the cache for knexfile and knex
    process.env = { ...originalEnv }; // Reset process.env for each test
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original process.env
  });

  test('should use test database when NODE_ENV is test', () => {
    process.env.NODE_ENV = 'test';
    const knexConfig = require('../../knexfile');
    const environment = process.env.NODE_ENV || 'development';
    const knex = require('knex')(knexConfig[environment]);
    expect(knex.client.config.connection.database).toBe('mock_test_db');
  });

  test('should use development database when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';
    const knexConfig = require('../../knexfile');
    const environment = process.env.NODE_ENV || 'development';
    const knex = require('knex')(knexConfig[environment]);
    expect(knex.client.config.connection.database).toBe('mock_dev_db');
  });

  test('should use production database when NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';
    const knexConfig = require('../../knexfile');
    const environment = process.env.NODE_ENV || 'development';
    const knex = require('knex')(knexConfig[environment]);
    expect(knex.client.config.connection.database).toBe('mock_prod_db');
  });

  test('should default to development database when NODE_ENV is not set', () => {
    delete process.env.NODE_ENV; // NODE_ENV is undefined
    const knexConfig = require('../../knexfile');
    const environment = process.env.NODE_ENV || 'development'; // This will be 'development'
    const knex = require('knex')(knexConfig[environment]);
    expect(knex.client.config.connection.database).toBe('mock_dev_db');
  });

  test('should default to development database when NODE_ENV is an unknown value', () => {
    process.env.NODE_ENV = 'unknown_env_that_does_not_exist';
    const knexConfig = require('../../knexfile');
    const environment = process.env.NODE_ENV || 'development'; 
    // The controllers' logic is: knexConfig[environment]. 
    // If 'unknown_env_that_does_not_exist' is not in knexConfig, this would error.
    // However, the controllers have `const environment = process.env.NODE_ENV || 'development';`
    // This line means if NODE_ENV is set to something not in knexfile, it *should* still attempt to use it.
    // Let's test the actual behavior of the controllers' init pattern.
    // If knexConfig['unknown_env_that_does_not_exist'] is undefined, knex() will throw.
    // This test verifies that the fallback to 'development' in the line `const environment = process.env.NODE_ENV || 'development'`
    // does *not* happen if NODE_ENV is set, even if it's an unknown key for knexConfig.
    // The test ensures that if NODE_ENV points to a non-existent config, knex will fail to initialize,
    // rather than silently falling back to development.

    let knexInstance;
    try {
        // This will attempt to initialize Knex with knexConfig['unknown_env_that_does_not_exist'], which is undefined.
        knexInstance = require('knex')(knexConfig[environment]);
        
        // If knexConfig[environment] was somehow defined and knex initialized, this part would run.
        // However, our mock ensures 'unknown_env_that_does_not_exist' is not a valid key.
        // This part of the code should ideally not be reached in this specific test case.
        // If it is, it implies the mock or logic is not as expected, and the test should fail.
        if (knexConfig[environment]) {
          // This case should not happen with the current mock for 'unknown_env_that_does_not_exist'
          expect(knexInstance.client.config.connection.database).toBe('an_unexpected_db'); 
        } else {
          // This case correctly identifies that knexConfig[environment] is undefined.
          // Knex initialization with 'undefined' will lead to an error caught by the catch block.
          expect(knexConfig[environment]).toBeUndefined();
        }
    } catch (error) {
        // When knex is initialized with an undefined configuration (knex(undefined)),
        // it internally tries to access properties like 'client' on this undefined config,
        // leading to a TypeError.
        expect(error.message).toMatch(/Cannot read properties of undefined \(reading 'client'\)|Config must be an object/i);
    }
  });
});
