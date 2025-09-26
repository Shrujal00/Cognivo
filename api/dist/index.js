"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const ai_1 = require("./services/ai");
const user_service_1 = require("./services/user-service");
const swagger_1 = require("./middleware/swagger");
const app = (0, express_1.default)();
const port = process.env.PORT || 3002; // Changed port to 3002 to avoid conflict with other servers
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:3002', 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Swagger Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_1.swaggerUiMiddleware);
app.use('/api-docs.json', swagger_1.swaggerMiddleware);
// Multer configuration for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'text/plain'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
// Initialize Services
const aiService = new ai_1.AIService();
const userService = new user_service_1.UserService();
// In-memory user storage (replace with database in production)
const users = [];
let nextUserId = 1;
// JWT Secret (should be in environment variables in production)
const JWT_SECRET = 'your-secret-key';
const JWT_REFRESH_SECRET = 'your-refresh-secret-key';
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Cognivo AI API'
    });
});
// AI Note Generation endpoint
app.post('/api/ai/generate-notes', async (req, res) => {
    try {
        const { content, options } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const notes = await aiService.generateNotes(content, options);
        res.json(notes);
    }
    catch (error) {
        console.error('Note generation error:', error);
        res.status(500).json({
            error: 'Failed to generate notes',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// AI Quiz Generation endpoint
app.post('/api/ai/generate-quiz', async (req, res) => {
    try {
        const { content, options } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const quiz = await aiService.generateQuiz(content, options);
        res.json(quiz);
    }
    catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({
            error: 'Failed to generate quiz',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// AI Q&A endpoint
app.post('/api/ai/answer-question', async (req, res) => {
    try {
        const { question, context, options } = req.body;
        if (!question || !context) {
            return res.status(400).json({ error: 'Question and context are required' });
        }
        const answer = await aiService.answerQuestion(question, context, options);
        res.json(answer);
    }
    catch (error) {
        console.error('Q&A error:', error);
        res.status(500).json({
            error: 'Failed to answer question',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// AI Translation endpoint
app.post('/api/ai/translate', async (req, res) => {
    try {
        const { content, targetLanguage, options } = req.body;
        if (!content || !targetLanguage) {
            return res.status(400).json({ error: 'Content and target language are required' });
        }
        const translation = await aiService.translateContent(content, targetLanguage, options);
        res.json(translation);
    }
    catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({
            error: 'Failed to translate content',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// AI Flashcard Generation endpoint
app.post('/api/ai/generate-flashcards', async (req, res) => {
    try {
        const { content, options } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const flashcards = await aiService.generateFlashcards(content, options);
        res.json(flashcards);
    }
    catch (error) {
        console.error('Flashcard generation error:', error);
        res.status(500).json({
            error: 'Failed to generate flashcards',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Audio-to-Text Transcription endpoint
app.post('/api/ai/transcribe-audio', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Audio file is required' });
        }
        const options = req.body.options ? JSON.parse(req.body.options) : {
            includeTimestamps: true,
            includeConfidence: true,
            includeSpeakerDiarization: false,
            maxAlternatives: 1
        };
        const transcription = await aiService.transcribeAudio(req.file.buffer, options);
        res.json(transcription);
    }
    catch (error) {
        console.error('Audio transcription error:', error);
        res.status(500).json({
            error: 'Failed to transcribe audio',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Study Roadmap Generation endpoint
app.post('/api/ai/generate-roadmap', async (req, res) => {
    try {
        const { options } = req.body;
        if (!options || !options.subject) {
            return res.status(400).json({ error: 'Subject and options are required' });
        }
        const roadmap = await aiService.generateStudyRoadmap(options);
        res.json(roadmap);
    }
    catch (error) {
        console.error('Roadmap generation error:', error);
        res.status(500).json({
            error: 'Failed to generate study roadmap',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Perfect Question Generation endpoint
app.post('/api/ai/generate-perfect-questions', async (req, res) => {
    try {
        const { content, options } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const questions = await aiService.generatePerfectQuestions(content, options);
        res.json(questions);
    }
    catch (error) {
        console.error('Perfect question generation error:', error);
        res.status(500).json({
            error: 'Failed to generate perfect questions',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Image/Graph Generation endpoint
app.post('/api/ai/generate-images', async (req, res) => {
    try {
        const { content, options } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const images = await aiService.generateStudyImages(content, options);
        res.json(images);
    }
    catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({
            error: 'Failed to generate images',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Research PDF Generation endpoint
app.post('/api/ai/generate-research-pdf', async (req, res) => {
    try {
        const { content, options } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const researchPDF = await aiService.generateResearchPDF(content, options);
        res.json(researchPDF);
    }
    catch (error) {
        console.error('Research PDF generation error:', error);
        res.status(500).json({
            error: 'Failed to generate research PDF',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Text extraction from PDF endpoint
app.post('/api/ai/extract-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'PDF file is required' });
        }
        const extractedText = await aiService.extractTextFromPDF(req.file.buffer);
        res.json(extractedText);
    }
    catch (error) {
        console.error('PDF extraction error:', error);
        res.status(500).json({
            error: 'Failed to extract text from PDF',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Text extraction from image endpoint
app.post('/api/ai/extract-image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }
        const extractedText = await aiService.extractTextFromImage(req.file.buffer);
        res.json(extractedText);
    }
    catch (error) {
        console.error('Image extraction error:', error);
        res.status(500).json({
            error: 'Failed to extract text from image',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Generic text extraction endpoint
app.post('/api/ai/extract-text', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'File is required' });
        }
        const extractedText = await aiService.extractTextFromDocument(req.file.buffer, req.file.mimetype);
        res.json(extractedText);
    }
    catch (error) {
        console.error('Text extraction error:', error);
        res.status(500).json({
            error: 'Failed to extract text from file',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});
// User and Dashboard Endpoints
/**
 * @swagger
 * /api/user/dashboard:
 *   get:
 *     summary: Get user dashboard data
 *     description: Retrieves user progress data, badges, and recommendations for the dashboard
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (optional, defaults to current user if authenticated)
 *     responses:
 *       200:
 *         description: Dashboard data successfully retrieved
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
app.get('/api/user/dashboard', async (req, res) => {
    try {
        const userId = req.query.userId || 'default-user';
        // In a real app, this would use authentication to get the current user
        const progressData = await userService.getUserProgress(userId);
        res.json({
            success: true,
            data: progressData
        });
    }
    catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data'
        });
    }
});
/**
 * @swagger
 * /api/user/xp:
 *   post:
 *     summary: Add XP to user account
 *     description: Add experience points to user account and return updated level
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: XP added successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.post('/api/user/xp', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        if (!userId || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID or XP amount'
            });
        }
        const result = await userService.addUserXP(userId, amount);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error adding XP:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add XP'
        });
    }
});
// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email, password and name are required'
            });
        }
        // Check if user already exists (in-memory check)
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });
        }
        // Create new user
        const user = {
            id: String(nextUserId++),
            email,
            password, // In production, hash this password!
            name,
            createdAt: new Date().toISOString()
        };
        users.push(user);
        res.status(201).json({
            success: true,
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register user'
        });
    }
});
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        // Find user (in-memory)
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // In a real app, generate JWT tokens here
        const accessToken = 'fake-access-token';
        const refreshToken = 'fake-refresh-token';
        res.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to authenticate user'
        });
    }
});
app.post('/api/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }
        // In a real app, validate the refresh token and generate a new access token
        const accessToken = 'new-fake-access-token';
        res.json({
            success: true,
            accessToken
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token'
        });
    }
});
app.get('/api/auth/me', async (req, res) => {
    // In a real app, get the user ID from the JWT token
    // For now, just return a fake user
    res.json({
        id: '1',
        email: 'user@example.com',
        name: 'Test User'
    });
});
// Start server
app.listen(port, () => {
    console.log(`🚀 EduNexus AI API server running on port ${port}`);
    console.log(`📚 Available endpoints:`);
    console.log(`   POST /api/ai/generate-notes - Generate study notes`);
    console.log(`   POST /api/ai/generate-quiz - Generate quiz questions`);
    console.log(`   POST /api/ai/answer-question - Answer questions with context`);
    console.log(`   POST /api/ai/translate - Translate educational content`);
    console.log(`   POST /api/ai/generate-flashcards - Generate flashcard sets`);
    console.log(`   POST /api/ai/transcribe-audio - Convert audio to text`);
    console.log(`   POST /api/ai/generate-roadmap - Generate study roadmaps`);
    console.log(`   POST /api/ai/generate-perfect-questions - Generate perfect questions`);
    console.log(`   POST /api/ai/generate-images - Generate study images/graphs`);
    console.log(`   POST /api/ai/generate-research-pdf - Generate research PDFs`);
    console.log(`   POST /api/ai/extract-pdf - Extract text from PDF`);
    console.log(`   POST /api/ai/extract-image - Extract text from image (OCR)`);
    console.log(`   POST /api/ai/extract-text - Extract text from any supported file`);
    console.log(`   GET /health - Health check`);
});
exports.default = app;
//# sourceMappingURL=index.js.map