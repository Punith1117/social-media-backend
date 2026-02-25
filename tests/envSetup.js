require('dotenv').config();

// Use TEST_DATABASE_URL for tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
