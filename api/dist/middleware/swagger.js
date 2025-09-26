"use strict";
/**
 * Swagger/OpenAPI Documentation Middleware for Cognivo AI
 * Professional API documentation with interactive testing
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUiMiddleware = exports.swaggerMiddleware = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Cognivo AI API',
            version: '1.0.0',
            description: 'AI-powered educational platform with note generation, quiz creation, and Q&A system',
            contact: {
                name: 'Cognivo Team',
                email: 'support@cognivo.com',
                url: 'https://github.com/cognivo'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://api.cognivo.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'API key for authentication'
                }
            },
            schemas: {
                NoteGenerationOptions: {
                    type: 'object',
                    required: ['difficulty', 'style', 'language'],
                    properties: {
                        difficulty: {
                            type: 'string',
                            enum: ['easy', 'medium', 'hard'],
                            description: 'Difficulty level of the generated notes'
                        },
                        style: {
                            type: 'string',
                            enum: ['academic', 'casual', 'detailed', 'summary'],
                            description: 'Style of the generated notes'
                        },
                        language: {
                            type: 'string',
                            description: 'Language code for the generated notes',
                            example: 'en'
                        },
                        includeExamples: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether to include examples in the notes'
                        },
                        includeQuestions: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether to include study questions'
                        },
                        maxLength: {
                            type: 'number',
                            description: 'Maximum length of the generated content',
                            example: 2000
                        }
                    }
                },
                GeneratedNote: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Title of the generated notes'
                        },
                        keyConcepts: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of key concepts extracted'
                        },
                        content: {
                            type: 'string',
                            description: 'Main content of the notes'
                        },
                        examples: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Examples included in the notes'
                        },
                        studyQuestions: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Study questions generated'
                        },
                        difficulty: {
                            type: 'string',
                            description: 'Difficulty level of the notes'
                        },
                        language: {
                            type: 'string',
                            description: 'Language of the notes'
                        },
                        confidence: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            description: 'Confidence score of the generation'
                        }
                    }
                },
                QuizGenerationOptions: {
                    type: 'object',
                    required: ['questionCount', 'difficulty', 'questionTypes', 'language'],
                    properties: {
                        questionCount: {
                            type: 'number',
                            minimum: 1,
                            maximum: 50,
                            description: 'Number of questions to generate'
                        },
                        difficulty: {
                            type: 'string',
                            enum: ['easy', 'medium', 'hard'],
                            description: 'Difficulty level of the quiz'
                        },
                        questionTypes: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['multiple-choice', 'short-answer', 'true-false', 'cloze']
                            },
                            description: 'Types of questions to include'
                        },
                        subject: {
                            type: 'string',
                            description: 'Subject area for the quiz'
                        },
                        language: {
                            type: 'string',
                            description: 'Language code for the quiz'
                        }
                    }
                },
                GeneratedQuiz: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Unique identifier for the quiz'
                        },
                        title: {
                            type: 'string',
                            description: 'Title of the quiz'
                        },
                        questions: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/QuizQuestion'
                            }
                        },
                        totalQuestions: {
                            type: 'number',
                            description: 'Total number of questions'
                        },
                        difficulty: {
                            type: 'string',
                            description: 'Difficulty level'
                        },
                        subject: {
                            type: 'string',
                            description: 'Subject area'
                        },
                        language: {
                            type: 'string',
                            description: 'Language code'
                        },
                        estimatedTime: {
                            type: 'number',
                            description: 'Estimated time in minutes'
                        }
                    }
                },
                FlashcardGenerationOptions: {
                    type: 'object',
                    required: ['cardCount', 'difficulty', 'cardType', 'language'],
                    properties: {
                        cardCount: {
                            type: 'number',
                            minimum: 1,
                            maximum: 100,
                            description: 'Number of flashcards to generate'
                        },
                        difficulty: {
                            type: 'string',
                            enum: ['easy', 'medium', 'hard'],
                            description: 'Difficulty level of the flashcards'
                        },
                        cardType: {
                            type: 'string',
                            enum: ['basic', 'cloze', 'multiple-choice', 'image-based'],
                            description: 'Type of flashcards to generate'
                        },
                        language: {
                            type: 'string',
                            description: 'Language code for the flashcards'
                        },
                        includeImages: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether to include image references'
                        },
                        includeAudio: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether to include audio references'
                        },
                        subject: {
                            type: 'string',
                            description: 'Subject area for the flashcards'
                        }
                    }
                },
                Flashcard: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Flashcard identifier'
                        },
                        front: {
                            type: 'string',
                            description: 'Front side content (question/prompt)'
                        },
                        back: {
                            type: 'string',
                            description: 'Back side content (answer/explanation)'
                        },
                        difficulty: {
                            type: 'string',
                            description: 'Flashcard difficulty'
                        },
                        subject: {
                            type: 'string',
                            description: 'Subject area'
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Flashcard tags'
                        },
                        hints: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Study hints'
                        },
                        examples: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Example usage'
                        },
                        imageUrl: {
                            type: 'string',
                            description: 'Optional image URL'
                        },
                        audioUrl: {
                            type: 'string',
                            description: 'Optional audio URL'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        }
                    }
                },
                GeneratedFlashcardSet: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Flashcard set identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Flashcard set title'
                        },
                        description: {
                            type: 'string',
                            description: 'Flashcard set description'
                        },
                        cards: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Flashcard'
                            }
                        },
                        totalCards: {
                            type: 'number',
                            description: 'Total number of flashcards'
                        },
                        difficulty: {
                            type: 'string',
                            description: 'Overall difficulty level'
                        },
                        subject: {
                            type: 'string',
                            description: 'Subject area'
                        },
                        language: {
                            type: 'string',
                            description: 'Language code'
                        },
                        estimatedStudyTime: {
                            type: 'number',
                            description: 'Estimated study time in minutes'
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Flashcard set tags'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        }
                    }
                },
                RoadmapGenerationOptions: {
                    type: 'object',
                    required: ['subject', 'difficulty', 'duration', 'hoursPerWeek', 'language'],
                    properties: {
                        subject: {
                            type: 'string',
                            description: 'Subject area for the roadmap',
                            example: 'Machine Learning'
                        },
                        difficulty: {
                            type: 'string',
                            enum: ['beginner', 'intermediate', 'advanced'],
                            description: 'Difficulty level'
                        },
                        duration: {
                            type: 'number',
                            minimum: 1,
                            maximum: 52,
                            description: 'Duration in weeks',
                            example: 8
                        },
                        hoursPerWeek: {
                            type: 'number',
                            minimum: 1,
                            maximum: 40,
                            description: 'Hours per week to study',
                            example: 10
                        },
                        learningStyle: {
                            type: 'string',
                            enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
                            description: 'Preferred learning style'
                        },
                        goals: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Learning goals',
                            example: ['Understand neural networks', 'Build ML projects']
                        },
                        prerequisites: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Prerequisites',
                            example: ['Python basics', 'Statistics knowledge']
                        },
                        language: {
                            type: 'string',
                            description: 'Language code',
                            example: 'en'
                        }
                    }
                },
                StudyRoadmap: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Roadmap identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Roadmap title'
                        },
                        subject: {
                            type: 'string',
                            description: 'Subject area'
                        },
                        difficulty: {
                            type: 'string',
                            description: 'Difficulty level'
                        },
                        duration: {
                            type: 'number',
                            description: 'Duration in weeks'
                        },
                        totalHours: {
                            type: 'number',
                            description: 'Total study hours'
                        },
                        milestones: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/RoadmapMilestone'
                            }
                        },
                        weeklySchedule: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/WeeklySchedule'
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        }
                    }
                },
                RoadmapMilestone: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Milestone identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Milestone title'
                        },
                        description: {
                            type: 'string',
                            description: 'Milestone description'
                        },
                        week: {
                            type: 'number',
                            description: 'Week number'
                        },
                        topics: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Topics to cover'
                        },
                        resources: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Learning resources'
                        },
                        activities: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Learning activities'
                        },
                        assessment: {
                            type: 'string',
                            description: 'Assessment method'
                        },
                        estimatedHours: {
                            type: 'number',
                            description: 'Estimated hours for this milestone'
                        },
                        completed: {
                            type: 'boolean',
                            description: 'Completion status'
                        }
                    }
                },
                WeeklySchedule: {
                    type: 'object',
                    properties: {
                        week: {
                            type: 'number',
                            description: 'Week number'
                        },
                        milestones: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Milestone IDs for this week'
                        },
                        hours: {
                            type: 'number',
                            description: 'Scheduled hours for this week'
                        }
                    }
                },
                PerfectQuestionOptions: {
                    type: 'object',
                    required: ['questionType', 'difficulty', 'cognitiveLevel', 'language'],
                    properties: {
                        questionType: {
                            type: 'string',
                            enum: ['multiple-choice', 'short-answer', 'essay', 'true-false'],
                            description: 'Type of question to generate'
                        },
                        difficulty: {
                            type: 'string',
                            enum: ['easy', 'medium', 'hard'],
                            description: 'Question difficulty level'
                        },
                        cognitiveLevel: {
                            type: 'string',
                            enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'],
                            description: 'Blooms taxonomy cognitive level'
                        },
                        questionCount: {
                            type: 'number',
                            minimum: 1,
                            maximum: 20,
                            default: 5,
                            description: 'Number of questions to generate'
                        },
                        language: {
                            type: 'string',
                            description: 'Language code'
                        },
                        includeExplanations: {
                            type: 'boolean',
                            default: true,
                            description: 'Include detailed explanations'
                        },
                        pointValue: {
                            type: 'number',
                            default: 10,
                            description: 'Point value for each question'
                        }
                    }
                },
                PerfectQuestionSet: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Question set identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Question set title'
                        },
                        questions: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/PerfectQuestion'
                            }
                        },
                        totalQuestions: {
                            type: 'number',
                            description: 'Total number of questions'
                        },
                        difficulty: {
                            type: 'string',
                            description: 'Overall difficulty level'
                        },
                        cognitiveLevel: {
                            type: 'string',
                            description: 'Primary cognitive level'
                        },
                        totalPoints: {
                            type: 'number',
                            description: 'Total points possible'
                        },
                        estimatedTime: {
                            type: 'number',
                            description: 'Estimated completion time in minutes'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        }
                    }
                },
                PerfectQuestion: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Question identifier'
                        },
                        type: {
                            type: 'string',
                            description: 'Question type'
                        },
                        question: {
                            type: 'string',
                            description: 'Question text'
                        },
                        options: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Answer options (for multiple choice)'
                        },
                        correctAnswer: {
                            type: 'string',
                            description: 'Correct answer'
                        },
                        explanation: {
                            type: 'string',
                            description: 'Detailed explanation'
                        },
                        difficulty: {
                            type: 'string',
                            description: 'Question difficulty'
                        },
                        cognitiveLevel: {
                            type: 'string',
                            description: 'Blooms taxonomy level'
                        },
                        pointValue: {
                            type: 'number',
                            description: 'Point value'
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Question tags'
                        }
                    }
                },
                ImageGenerationOptions: {
                    type: 'object',
                    required: ['style', 'complexity', 'language'],
                    properties: {
                        style: {
                            type: 'string',
                            enum: ['academic', 'diagram', 'infographic', 'mindmap', 'timeline', 'flowchart'],
                            description: 'Visual style'
                        },
                        complexity: {
                            type: 'string',
                            enum: ['simple', 'detailed', 'comprehensive'],
                            description: 'Complexity level'
                        },
                        includeLabels: {
                            type: 'boolean',
                            default: true,
                            description: 'Include labels and annotations'
                        },
                        includeColors: {
                            type: 'boolean',
                            default: true,
                            description: 'Use colors in the visualization'
                        },
                        language: {
                            type: 'string',
                            description: 'Language for labels and text'
                        }
                    }
                },
                GeneratedImage: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Image identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Image title'
                        },
                        description: {
                            type: 'string',
                            description: 'Image description'
                        },
                        imageUrl: {
                            type: 'string',
                            description: 'Generated image URL'
                        },
                        style: {
                            type: 'string',
                            description: 'Visual style used'
                        },
                        complexity: {
                            type: 'string',
                            description: 'Complexity level'
                        },
                        labels: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Image labels'
                        },
                        relatedTopics: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Related topics'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        }
                    }
                },
                ResearchPDFOptions: {
                    type: 'object',
                    required: ['format', 'length', 'language'],
                    properties: {
                        format: {
                            type: 'string',
                            enum: ['academic', 'report', 'summary', 'analysis'],
                            description: 'Document format'
                        },
                        length: {
                            type: 'string',
                            enum: ['short', 'medium', 'long'],
                            description: 'Document length'
                        },
                        includeReferences: {
                            type: 'boolean',
                            default: true,
                            description: 'Include references section'
                        },
                        includeAbstract: {
                            type: 'boolean',
                            default: true,
                            description: 'Include abstract'
                        },
                        includeTableOfContents: {
                            type: 'boolean',
                            default: true,
                            description: 'Include table of contents'
                        },
                        language: {
                            type: 'string',
                            description: 'Document language'
                        }
                    }
                },
                ResearchPDF: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Document identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Document title'
                        },
                        content: {
                            type: 'string',
                            description: 'Full document content'
                        },
                        format: {
                            type: 'string',
                            description: 'Document format'
                        },
                        length: {
                            type: 'string',
                            description: 'Document length category'
                        },
                        wordCount: {
                            type: 'number',
                            description: 'Word count'
                        },
                        sections: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/DocumentSection'
                            }
                        },
                        references: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Reference'
                            }
                        },
                        abstract: {
                            type: 'string',
                            description: 'Document abstract'
                        },
                        tableOfContents: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/TOCEntry'
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        }
                    }
                },
                DocumentSection: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Section title'
                        },
                        content: {
                            type: 'string',
                            description: 'Section content'
                        },
                        pageNumber: {
                            type: 'number',
                            description: 'Page number'
                        }
                    }
                },
                Reference: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Reference title'
                        },
                        url: {
                            type: 'string',
                            description: 'Reference URL'
                        },
                        authors: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Authors'
                        }
                    }
                },
                TOCEntry: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'TOC entry title'
                        },
                        pageNumber: {
                            type: 'number',
                            description: 'Page number'
                        }
                    }
                },
                QuizQuestion: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Question identifier'
                        },
                        type: {
                            type: 'string',
                            enum: ['multiple-choice', 'short-answer', 'true-false', 'cloze'],
                            description: 'Type of question'
                        },
                        question: {
                            type: 'string',
                            description: 'Question text'
                        },
                        options: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Answer options (for multiple choice)'
                        },
                        correctAnswer: {
                            oneOf: [
                                { type: 'string' },
                                { type: 'array', items: { type: 'string' } }
                            ],
                            description: 'Correct answer(s)'
                        },
                        explanation: {
                            type: 'string',
                            description: 'Explanation of the correct answer'
                        },
                        difficulty: {
                            type: 'string',
                            description: 'Question difficulty'
                        }
                    }
                },
                QAOptions: {
                    type: 'object',
                    properties: {
                        context: {
                            type: 'string',
                            description: 'Context for answering the question'
                        },
                        language: {
                            type: 'string',
                            default: 'en',
                            description: 'Language for the answer'
                        },
                        includeSource: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether to include source attribution'
                        },
                        maxLength: {
                            type: 'number',
                            description: 'Maximum length of the answer'
                        }
                    }
                },
                QAAnswer: {
                    type: 'object',
                    properties: {
                        answer: {
                            type: 'string',
                            description: 'Generated answer'
                        },
                        confidence: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            description: 'Confidence score of the answer'
                        },
                        sources: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Source references'
                        },
                        relatedTopics: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Related topics'
                        },
                        followUpQuestions: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Suggested follow-up questions'
                        },
                        language: {
                            type: 'string',
                            description: 'Language of the answer'
                        }
                    }
                },
                TranslationOptions: {
                    type: 'object',
                    properties: {
                        targetLanguage: {
                            type: 'string',
                            description: 'Target language code'
                        },
                        preserveFormatting: {
                            type: 'boolean',
                            default: true,
                            description: 'Whether to preserve formatting'
                        },
                        educationalOptimization: {
                            type: 'boolean',
                            default: true,
                            description: 'Whether to optimize for educational content'
                        },
                        confidenceThreshold: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            default: 0.8,
                            description: 'Minimum confidence threshold'
                        }
                    }
                },
                TranslationResult: {
                    type: 'object',
                    properties: {
                        originalText: {
                            type: 'string',
                            description: 'Original text'
                        },
                        translatedText: {
                            type: 'string',
                            description: 'Translated text'
                        },
                        targetLanguage: {
                            type: 'string',
                            description: 'Target language'
                        },
                        confidence: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            description: 'Translation confidence'
                        },
                        preservedFormatting: {
                            type: 'boolean',
                            description: 'Whether formatting was preserved'
                        },
                        educationalTerms: {
                            type: 'object',
                            additionalProperties: { type: 'string' },
                            description: 'Educational terminology mappings'
                        }
                    }
                },
                ExtractedText: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: 'Extracted text content'
                        },
                        metadata: {
                            type: 'object',
                            properties: {
                                pageCount: {
                                    type: 'number',
                                    description: 'Number of pages (for PDFs)'
                                },
                                dimensions: {
                                    type: 'object',
                                    properties: {
                                        width: { type: 'number' },
                                        height: { type: 'number' }
                                    }
                                },
                                fileSize: {
                                    type: 'number',
                                    description: 'File size in bytes'
                                },
                                mimeType: {
                                    type: 'string',
                                    description: 'MIME type of the file'
                                },
                                extractedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'Timestamp of extraction'
                                }
                            }
                        },
                        confidence: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1,
                            description: 'Extraction confidence score'
                        },
                        language: {
                            type: 'string',
                            description: 'Detected language'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message'
                        },
                        details: {
                            type: 'string',
                            description: 'Detailed error information'
                        },
                        code: {
                            type: 'string',
                            description: 'Error code'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Error timestamp'
                        }
                    }
                }
            }
        },
        paths: {
            '/health': {
                get: {
                    tags: ['System'],
                    summary: 'Health check endpoint',
                    description: 'Returns the health status of the API service',
                    responses: {
                        '200': {
                            description: 'Service is healthy',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'healthy' },
                                            timestamp: { type: 'string', format: 'date-time' },
                                            service: { type: 'string', example: 'Cognivo AI API' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/generate-notes': {
                post: {
                    tags: ['AI Features'],
                    summary: 'Generate study notes',
                    description: 'Generate structured study notes from text content using AI',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['content', 'options'],
                                    properties: {
                                        content: {
                                            type: 'string',
                                            description: 'Text content to generate notes from',
                                            example: 'Machine learning is a subset of artificial intelligence...'
                                        },
                                        options: {
                                            $ref: '#/components/schemas/NoteGenerationOptions'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Notes generated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/GeneratedNote'
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - missing or invalid input',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/generate-quiz': {
                post: {
                    tags: ['AI Features'],
                    summary: 'Generate quiz questions',
                    description: 'Generate quiz questions from text content using AI',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['content', 'options'],
                                    properties: {
                                        content: {
                                            type: 'string',
                                            description: 'Text content to generate quiz from',
                                            example: 'Photosynthesis is the process by which plants...'
                                        },
                                        options: {
                                            $ref: '#/components/schemas/QuizGenerationOptions'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Quiz generated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/GeneratedQuiz'
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - missing or invalid input',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/answer-question': {
                post: {
                    tags: ['AI Features'],
                    summary: 'Answer questions with context',
                    description: 'Answer questions using provided context and AI',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['question', 'context'],
                                    properties: {
                                        question: {
                                            type: 'string',
                                            description: 'Question to answer',
                                            example: 'What is the main purpose of photosynthesis?'
                                        },
                                        context: {
                                            type: 'string',
                                            description: 'Context for answering the question',
                                            example: 'Photosynthesis is the process by which plants...'
                                        },
                                        options: {
                                            $ref: '#/components/schemas/QAOptions'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Question answered successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/QAAnswer'
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - missing question or context',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/translate': {
                post: {
                    tags: ['AI Features'],
                    summary: 'Translate content',
                    description: 'Translate educational content to different languages',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['content', 'targetLanguage'],
                                    properties: {
                                        content: {
                                            type: 'string',
                                            description: 'Content to translate',
                                            example: 'Machine learning is a subset of artificial intelligence.'
                                        },
                                        targetLanguage: {
                                            type: 'string',
                                            description: 'Target language code',
                                            example: 'es'
                                        },
                                        options: {
                                            $ref: '#/components/schemas/TranslationOptions'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Content translated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/TranslationResult'
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - missing content or target language',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/generate-flashcards': {
                post: {
                    tags: ['AI Features'],
                    summary: 'Generate flashcard sets',
                    description: 'Generate flashcard sets from educational content using AI',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['content', 'options'],
                                    properties: {
                                        content: {
                                            type: 'string',
                                            description: 'Educational content to generate flashcards from',
                                            example: 'Photosynthesis is the process by which plants convert light energy into chemical energy using sunlight, carbon dioxide, and water.'
                                        },
                                        options: {
                                            $ref: '#/components/schemas/FlashcardGenerationOptions'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Flashcards generated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/GeneratedFlashcardSet'
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - missing content or invalid options',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/generate-roadmap': {
                post: {
                    tags: ['AI Features'],
                    summary: 'Generate study roadmap',
                    description: 'Generate personalized study roadmaps based on subject, difficulty, and learning preferences',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['options'],
                                    properties: {
                                        options: {
                                            $ref: '#/components/schemas/RoadmapGenerationOptions'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Roadmap generated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/StudyRoadmap'
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - invalid options',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/generate-perfect-questions': {
                post: {
                    tags: ['AI Features'],
                    summary: 'Generate perfect questions',
                    description: 'Generate high-quality educational questions with cognitive level targeting',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['content', 'options'],
                                    properties: {
                                        content: {
                                            type: 'string',
                                            description: 'Educational content to generate questions from',
                                            example: 'Machine learning algorithms can identify patterns in data to make predictions. Supervised learning uses labeled data, while unsupervised learning finds hidden patterns.'
                                        },
                                        options: {
                                            $ref: '#/components/schemas/PerfectQuestionOptions'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Questions generated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/PerfectQuestionSet'
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - invalid content or options',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/generate-images': {
                post: {
                    tags: ['AI Features'],
                    summary: 'Generate educational images',
                    description: 'Generate educational diagrams, charts, and visual learning materials',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['content', 'options'],
                                    properties: {
                                        content: {
                                            type: 'string',
                                            description: 'Educational content to visualize',
                                            example: 'Neural network architecture with input, hidden, and output layers'
                                        },
                                        options: {
                                            $ref: '#/components/schemas/ImageGenerationOptions'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Images generated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/GeneratedImage'
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - invalid content or options',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/generate-research-pdf': {
                post: {
                    tags: ['AI Features'],
                    summary: 'Generate research PDF',
                    description: 'Generate comprehensive research documents in PDF format',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['topic', 'options'],
                                    properties: {
                                        topic: {
                                            type: 'string',
                                            description: 'Research topic',
                                            example: 'The Impact of Artificial Intelligence on Education'
                                        },
                                        options: {
                                            $ref: '#/components/schemas/ResearchPDFOptions'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Research PDF generated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ResearchPDF'
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - invalid topic or options',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/extract-pdf': {
                post: {
                    tags: ['Text Extraction'],
                    summary: 'Extract text from PDF',
                    description: 'Extract text content from PDF files',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        file: {
                                            type: 'string',
                                            format: 'binary',
                                            description: 'PDF file to extract text from'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Text extracted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ExtractedText'
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - missing file or invalid file type',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/extract-image': {
                post: {
                    tags: ['Text Extraction'],
                    summary: 'Extract text from image (OCR)',
                    description: 'Extract text from images using OCR technology',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        file: {
                                            type: 'string',
                                            format: 'binary',
                                            description: 'Image file to extract text from'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Text extracted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ExtractedText'
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - missing file or invalid file type',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/ai/extract-text': {
                post: {
                    tags: ['Text Extraction'],
                    summary: 'Extract text from any file',
                    description: 'Extract text from various file formats (PDF, DOCX, TXT, images)',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        file: {
                                            type: 'string',
                                            format: 'binary',
                                            description: 'File to extract text from'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Text extracted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ExtractedText'
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request - missing file or unsupported file type',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Internal server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/index.ts', './src/services/*.ts', './src/types/*.ts']
};
const specs = (0, swagger_jsdoc_1.default)(options);
const swaggerMiddleware = (req, res, next) => {
    if (req.path === '/api-docs') {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    }
    else {
        next();
    }
};
exports.swaggerMiddleware = swaggerMiddleware;
exports.swaggerUiMiddleware = swagger_ui_express_1.default.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Cognivo AI API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true
    }
});
exports.default = specs;
//# sourceMappingURL=swagger.js.map