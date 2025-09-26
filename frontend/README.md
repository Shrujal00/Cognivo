# Cognivo AI Frontend

A modern Next.js frontend for the Cognivo AI educational platform, featuring AI-powered study tools including chat assistance, study roadmaps, quizzes, flashcards, note generation, translation, and text extraction.

## 🚀 Features

### Core Features
- **AI Chat Assistant** - Ask questions and get educational explanations
- **Study Roadmap Generator** - Create comprehensive learning plans with milestones and tasks
- **AI Quiz Creator** - Generate quizzes from study materials with multiple question types
- **Smart Flashcards** - Create and study with AI-generated flashcard sets
- **AI Note Generator** - Transform content into structured study notes
- **Content Translation** - Translate educational content with context awareness
- **Text Extraction** - Extract text from PDFs, images, and documents using OCR

### Technical Features
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **React Hook Form** for form management
- **Zustand** for state management
- **Axios** for API communication
- **React Hot Toast** for notifications

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── chat/              # AI Chat interface
│   ├── roadmap/           # Study roadmap generator
│   ├── quizzes/           # Quiz generation and taking
│   ├── flashcards/        # Flashcard study interface
│   ├── notes/             # AI note generation
│   ├── translate/         # Content translation
│   ├── extract/           # Text extraction from files
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (redirects to chat)
│   └── globals.css        # Global styles
├── components/
│   └── layout/
│       ├── MainLayout.tsx # Main application layout
│       └── Sidebar.tsx    # Navigation sidebar
├── lib/
│   └── api.ts            # API service layer
└── types/
    └── api.ts            # TypeScript type definitions
```

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3001`

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL for the Cognivo API | `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL` | API endpoints base URL | `http://localhost:3000/api` |

### Backend Integration
This frontend connects to the Cognivo AI API backend. Make sure the backend is running on port 3000 before starting the frontend.

## 📱 Features Overview

### AI Chat Assistant (`/chat`)
- Real-time conversation with Cognivo AI
- Context-aware responses
- Educational explanations and guidance
- Message history
- Copy/export conversations

### Study Roadmap (`/roadmap`)
- Custom learning plan generation
- Weekly milestones with tasks
- Progress tracking
- Resource recommendations
- YouTube video suggestions
- Checklist-style task management

### AI Quizzes (`/quizzes`)
- Generate quizzes from any content
- Multiple question types:
  - Multiple choice
  - True/False
  - Short answer
  - Fill in the blank
- Interactive quiz taking experience
- Detailed results with explanations
- Progress tracking

### Smart Flashcards (`/flashcards`)
- AI-generated flashcard sets
- 3D flip animation
- Study progress tracking
- Multiple card types (basic, cloze, multiple choice)
- Shuffle and reset options
- Hints and examples

### AI Note Generator (`/notes`)
- Transform content into structured notes
- Multiple difficulty levels and styles
- Key concept extraction
- Examples and study questions
- Export to Markdown
- Copy functionality

### Content Translation (`/translate`)
- AI-powered translation with educational optimization
- Support for 12+ languages
- Confidence scoring
- Educational terminology preservation
- Formatting preservation
- Bidirectional translation

### Text Extraction (`/extract`)
- PDF text extraction
- OCR for images (JPG, PNG, GIF, BMP)
- Document processing (TXT)
- Drag and drop file upload
- Metadata extraction
- Download extracted text

## 🎨 UI/UX Features

### Design System
- **Dark theme** optimized for long study sessions
- **Responsive design** works on desktop, tablet, and mobile
- **Consistent color palette** with primary blue theme
- **Smooth animations** and transitions
- **Accessibility** considerations throughout

### Navigation
- **Sidebar navigation** with clear feature categories
- **Breadcrumb navigation** for complex workflows
- **Progress indicators** for multi-step processes
- **Keyboard shortcuts** support

### Interactive Elements
- **Loading states** for all API operations
- **Error handling** with user-friendly messages
- **Toast notifications** for user feedback
- **Drag and drop** file uploads
- **Copy to clipboard** functionality

## 🚀 Scripts

```bash
# Development
npm run dev          # Start development server on port 3001

# Building
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 🔗 API Integration

The frontend communicates with the Cognivo AI backend through a typed API service layer:

```typescript
// Example API usage
import { apiService } from '@/lib/api';

// Generate notes
const notes = await apiService.generateNotes(content, options);

// Create quiz
const quiz = await apiService.generateQuiz(content, options);

// Ask question
const answer = await apiService.answerQuestion(question, context);
```

## 📊 State Management

The application uses React's built-in state management with hooks:
- `useState` for component state
- `useEffect` for side effects
- Custom hooks for complex state logic
- Props drilling for simple data flow

## 🔒 Security

- **Input validation** on all forms
- **File type validation** for uploads
- **XSS prevention** through React's built-in protections
- **Environment variable** protection
- **CORS** handling for API communication

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance

- **Code splitting** with Next.js automatic optimization
- **Image optimization** with Next.js Image component
- **Lazy loading** for route components
- **Optimized bundle size** with tree shaking
- **Caching** strategies for API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API examples
- Create an issue on GitHub

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- Complete UI for all Cognivo AI features
- Responsive design
- Dark theme
- TypeScript support
- API integration
- File upload capabilities

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**