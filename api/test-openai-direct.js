// Direct OpenAI API test
require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API directly...');
    console.log('API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 'undefined');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: 'Say "Hello, EduNexus AI is working!"'
        }
      ],
      max_tokens: 50
    });

    console.log('✅ OpenAI API Response:');
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('❌ OpenAI API Error:');
    console.error(error.message);
  }
}

testOpenAI();
