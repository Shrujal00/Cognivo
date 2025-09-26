#!/usr/bin/env node

/**
 * EduNexus AI Setup Script
 * Automatically configures the project with your OpenAI API key
 */

const fs = require('fs');
const path = require('path');

const API_KEY = '';

const envContent = `# OpenAI Configuration
OPENAI_API_KEY=${API_KEY}
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7

# Server Configuration
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,docx,txt,jpg,jpeg,png

# Cache Configuration
REDIS_URL=redis://localhost:6379
CACHE_TTL=300000

# Security
JWT_SECRET=your_jwt_secret_here_change_in_production
CORS_ORIGIN=http://localhost:3000

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
`;

console.log('🚀 Setting up EduNexus AI with your OpenAI API key...');

try {
  // Create .env file
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created successfully');
  
  // Verify API key format
  if (API_KEY.startsWith('sk-proj-')) {
    console.log('✅ OpenAI API key format verified');
  } else {
    console.log('⚠️  Warning: API key format may be incorrect');
  }
  
  console.log('\n🎉 Setup complete! You can now run:');
  console.log('   npm install');
  console.log('   npm run build');
  console.log('   npm start');
  console.log('\n📚 API Documentation will be available at:');
  console.log('   http://localhost:3000/api-docs');
  console.log('\n🔧 Health check:');
  console.log('   http://localhost:3000/health');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
