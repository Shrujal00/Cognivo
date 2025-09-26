// Test environment variable loading
require('dotenv').config();

console.log('Environment Variables Test:');
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 'undefined');
console.log('OPENAI_API_KEY first 10 chars:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) : 'undefined');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL);
console.log('NODE_ENV:', process.env.NODE_ENV);
