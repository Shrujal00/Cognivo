// Test API key loading
require('dotenv').config();

console.log('=== API Key Test ===');
console.log('Raw API Key:', JSON.stringify(process.env.OPENAI_API_KEY));
console.log('API Key Length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 'undefined');
console.log('First 20 chars:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 20) : 'undefined');
console.log('Last 20 chars:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 20) : 'undefined');

// Test if it starts with sk-proj
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-proj')) {
  console.log('✅ API Key format looks correct');
} else {
  console.log('❌ API Key format is incorrect');
}