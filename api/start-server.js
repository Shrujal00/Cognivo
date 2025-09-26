// Start server with proper environment setup
require('dotenv').config();

// Set the API key directly in the environment
process.env.OPENAI_API_KEY = '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';

console.log('🔑 API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('🔑 API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);

// Start the server
require('./dist/index.js');

