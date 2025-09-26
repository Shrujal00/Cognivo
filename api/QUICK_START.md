# 🚀 Cognivo AI - Quick Start Guide

## ⚡ **Ready to Go in 5 Minutes!**

Your OpenAI API key has been integrated and the system is ready to use.

---

## 🔑 **API Key Integration Complete**

✅ **OpenAI API Key**: ``

✅ **Model**: GPT-4 (Latest)
✅ **Configuration**: Production-ready settings
✅ **Rate Limiting**: Configured for optimal performance

---

## 🏃‍♂️ **Quick Start (3 Steps)**

### **Step 1: Test API Key**
```bash
# Test your OpenAI API key
npm run test:api
```

### **Step 2: Setup Environment**
```bash
# Configure the project with your API key
npm run setup
```

### **Step 3: Start the Server**
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

---

## 🌐 **Access Your AI Platform**

### **API Documentation**
- **Swagger UI**: http://localhost:3000/api-docs
- **API JSON**: http://localhost:3000/api-docs.json

### **Health Check**
- **Status**: http://localhost:3000/health

### **Available Endpoints**
- `POST /api/ai/generate-notes` - Generate study notes
- `POST /api/ai/generate-quiz` - Create quiz questions
- `POST /api/ai/answer-question` - AI Q&A system
- `POST /api/ai/translate` - Translate content
- `POST /api/ai/extract-pdf` - Extract text from PDFs
- `POST /api/ai/extract-image` - OCR text extraction

---

## 🧪 **Test the AI Features**

### **1. Generate Study Notes**
```bash
curl -X POST http://localhost:3000/api/ai/generate-notes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience.",
    "options": {
      "difficulty": "medium",
      "style": "academic",
      "language": "en",
      "includeExamples": true,
      "includeQuestions": true
    }
  }'
```

### **2. Create Quiz Questions**
```bash
curl -X POST http://localhost:3000/api/ai/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Photosynthesis is the process by which plants convert light energy into chemical energy.",
    "options": {
      "questionCount": 3,
      "difficulty": "easy",
      "questionTypes": ["multiple-choice", "true-false"],
      "subject": "Biology",
      "language": "en"
    }
  }'
```

### **3. Ask Questions**
```bash
curl -X POST http://localhost:3000/api/ai/answer-question \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the main purpose of photosynthesis?",
    "context": "Photosynthesis is the process by which plants convert light energy into chemical energy using sunlight, carbon dioxide, and water.",
    "options": {
      "language": "en",
      "includeSource": true
    }
  }'
```

### **4. Translate Content**
```bash
curl -X POST http://localhost:3000/api/ai/translate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Machine learning is revolutionizing education.",
    "targetLanguage": "es",
    "options": {
      "preserveFormatting": true,
      "educationalOptimization": true
    }
  }'
```

---

## 🐳 **Docker Deployment (Alternative)**

### **Quick Docker Setup**
```bash
# Build and run with Docker
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### **Docker Commands**
```bash
# Build image
docker build -t edunexus-ai .

# Run container
docker run -p 3000:3000 edunexus-ai

# Stop container
docker stop $(docker ps -q --filter ancestor=edunexus-ai)
```

---

## 📊 **Monitor Your System**

### **Health Monitoring**
```bash
# Check system health
curl http://localhost:3000/health

# Check metrics (if enabled)
curl http://localhost:3000/metrics
```

### **Log Monitoring**
```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

---

## 🔧 **Configuration Options**

### **Environment Variables**
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7

# Server Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,docx,txt,jpg,jpeg,png
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **API Key Not Working**
```bash
# Test API key
npm run test:api

# Check environment variables
echo $OPENAI_API_KEY
```

#### **Server Won't Start**
```bash
# Check if port is in use
netstat -tulpn | grep :3000

# Kill process using port 3000
sudo kill -9 $(lsof -t -i:3000)
```

#### **Dependencies Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **Build Errors**
```bash
# Check TypeScript errors
npm run type-check

# Fix linting issues
npm run lint:fix
```

---

## 🎯 **Hackathon Demo Script**

### **1. Start the System**
```bash
npm run setup
npm install
npm run build
npm start
```

### **2. Open API Documentation**
- Visit: http://localhost:3000/api-docs
- Show interactive testing interface

### **3. Live Demo Features**
1. **Generate Notes**: Upload content → Generate structured notes
2. **Create Quiz**: Input text → Generate quiz questions
3. **Ask Questions**: Provide context → Get AI answers
4. **Translate Content**: Input text → Translate to different languages
5. **Extract Text**: Upload PDF/image → Extract text content

### **4. Showcase Technical Features**
- **API Documentation**: Professional Swagger UI
- **Error Handling**: Graceful error responses
- **Rate Limiting**: API protection
- **Monitoring**: Health checks and metrics
- **Docker**: Containerized deployment

---

## 🏆 **Success Indicators**

### **✅ System Ready When:**
- Health check returns `200 OK`
- API documentation loads at `/api-docs`
- All AI endpoints respond correctly
- No error messages in logs
- Docker containers running (if using Docker)

### **🎉 Demo Ready When:**
- All 5 AI features working
- Interactive API testing available
- Professional presentation materials ready
- Live demo script prepared
- Technical architecture documented

---

## 📞 **Support & Help**

### **Quick Help**
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Logs**: Check console output for errors

### **Documentation**
- **Full README**: README.md
- **Deployment Guide**: DEPLOYMENT_GUIDE.md
- **Hackathon Presentation**: HACKATHON_PRESENTATION.md

---

## 🚀 **You're Ready!**

Your EduNexus AI platform is now fully configured and ready for your hackathon presentation. The system includes:

✅ **Working OpenAI API Integration**
✅ **Professional API Documentation**
✅ **All AI Features Implemented**
✅ **Production-Ready Architecture**
✅ **Docker Deployment Ready**
✅ **Comprehensive Testing Suite**
✅ **Monitoring & Logging**
✅ **Security Implementation**

**Good luck with your hackathon! 🏆**
