# Cognivo AI Features

A comprehensive AI-powered study platform with advanced features for note generation, quiz creation, Q&A systems, and content translation.

## 🚀 Features

### 1. AI Note Generation
- Generate structured study notes from raw text content
- Multiple difficulty levels (easy, medium, hard)
- Various styles (academic, casual, detailed, summary)
- Multi-language support
- Includes key concepts, examples, and study questions

### 2. AI Quiz Creation
- Create multiple-choice, short-answer, true/false, and cloze questions
- Configurable number of questions
- Difficulty-based question generation
- Subject-specific question generation
- Includes correct answers and explanations

### 3. AI Q&A System
- Context-aware question answering
- Uses uploaded study material as context
- Provides confidence scores
- Source attribution
- Educational explanations

### 4. AI Translation
- Translate educational content to multiple languages
- Preserves formatting and structure
- Educational terminology optimization
- Confidence scoring for translations

### 5. AI Text Extraction
- PDF text extraction using pdf-parse
- Image OCR using Tesseract.js
- Document text extraction (DOCX, TXT)
- Metadata extraction (page count, dimensions)

## 📁 Project Structure

```
src/
├── services/
│   └── ai.ts                    # Main AI service class
├── types/
│   └── ai.ts                    # AI-specific type definitions
├── config/
│   └── ai-config.ts             # AI configuration settings
├── utils/
│   ├── pdf-parser.ts            # PDF text extraction utility
│   ├── ocr-processor.ts         # Image OCR utility
│   └── text-processor.ts        # Text processing utilities
└── index.ts                     # Express.js API server
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edunexus-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Quick setup with integrated API key
   npm run setup
   
   # Or manually copy and edit
   cp env.example .env
   ```
   
   **Your OpenAI API key is already integrated!** The system is pre-configured with:
   ```
   OPENAI_API_KEY=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
   OPENAI_MODEL=gpt-4
   OPENAI_MAX_TOKENS=4000
   OPENAI_TEMPERATURE=0.7
   ```

4. **Test API key integration**
   ```bash
   npm run test:api
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Health Check
```http
GET /health
```

### Generate Study Notes
```http
POST /api/ai/generate-notes
Content-Type: application/json

{
  "content": "Your study content here...",
  "options": {
    "difficulty": "medium",
    "style": "academic",
    "language": "en",
    "includeExamples": true,
    "includeQuestions": true,
    "maxLength": 2000
  }
}
```

### Generate Quiz
```http
POST /api/ai/generate-quiz
Content-Type: application/json

{
  "content": "Your study content here...",
  "options": {
    "questionCount": 5,
    "difficulty": "medium",
    "questionTypes": ["multiple-choice", "short-answer"],
    "subject": "Mathematics",
    "language": "en"
  }
}
```

### Answer Questions
```http
POST /api/ai/answer-question
Content-Type: application/json

{
  "question": "What is the main concept?",
  "context": "Your study material context...",
  "options": {
    "language": "en",
    "includeSource": true,
    "maxLength": 500
  }
}
```

### Translate Content
```http
POST /api/ai/translate
Content-Type: application/json

{
  "content": "Content to translate...",
  "targetLanguage": "es",
  "options": {
    "preserveFormatting": true,
    "educationalOptimization": true,
    "confidenceThreshold": 0.8
  }
}
```

### Extract Text from PDF
```http
POST /api/ai/extract-pdf
Content-Type: multipart/form-data

file: [PDF file]
```

### Extract Text from Image (OCR)
```http
POST /api/ai/extract-image
Content-Type: multipart/form-data

file: [Image file]
```

### Extract Text from Any File
```http
POST /api/ai/extract-text
Content-Type: multipart/form-data

file: [Any supported file]
```

## 💻 Usage Examples

### JavaScript/TypeScript

```typescript
import { AIService } from './src/services/ai';

const aiService = new AIService();

// Generate notes
const notes = await aiService.generateNotes(
  "Machine learning is a subset of artificial intelligence...",
  {
    difficulty: 'medium',
    style: 'academic',
    language: 'en',
    includeExamples: true,
    includeQuestions: true
  }
);

// Generate quiz
const quiz = await aiService.generateQuiz(
  "Machine learning content...",
  {
    questionCount: 5,
    difficulty: 'medium',
    questionTypes: ['multiple-choice', 'short-answer'],
    subject: 'Computer Science',
    language: 'en'
  }
);

// Answer questions
const answer = await aiService.answerQuestion(
  "What is machine learning?",
  "Machine learning is a subset of AI...",
  { language: 'en', includeSource: true }
);
```

### cURL Examples

```bash
# Generate notes
curl -X POST http://localhost:3000/api/ai/generate-notes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Photosynthesis is the process by which plants convert light energy into chemical energy...",
    "options": {
      "difficulty": "medium",
      "style": "academic",
      "language": "en",
      "includeExamples": true,
      "includeQuestions": true
    }
  }'

# Generate quiz
curl -X POST http://localhost:3000/api/ai/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Photosynthesis content...",
    "options": {
      "questionCount": 3,
      "difficulty": "easy",
      "questionTypes": ["multiple-choice", "true-false"],
      "subject": "Biology",
      "language": "en"
    }
  }'

# Extract text from PDF
curl -X POST http://localhost:3000/api/ai/extract-pdf \
  -F "file=@document.pdf"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required) | - |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4` |
| `OPENAI_MAX_TOKENS` | Maximum tokens per request | `4000` |
| `OPENAI_TEMPERATURE` | Response randomness (0-2) | `0.7` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |

### Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Per Operation**: Tracked separately

### File Upload Limits

- **Max File Size**: 10MB
- **Allowed Types**: PDF, DOCX, TXT, JPG, JPEG, PNG, GIF, BMP

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📊 Performance

- **PDF Processing**: ~1-2 seconds per page
- **OCR Processing**: ~3-5 seconds per image
- **AI Generation**: ~2-10 seconds depending on content length
- **Rate Limiting**: 100 requests per 15 minutes

## 🔒 Security

- Input validation and sanitization
- File type verification
- Rate limiting to prevent abuse
- Error handling without sensitive data exposure
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples

## 🔄 Changelog

### v1.0.0
- Initial release
- AI note generation
- AI quiz creation
- AI Q&A system
- AI translation
- Text extraction from multiple formats
- REST API endpoints
- TypeScript support
