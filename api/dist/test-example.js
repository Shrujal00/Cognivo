"use strict";
/**
 * Example usage of Cognivo AI Features
 * This file demonstrates how to use the AI service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.demonstrateAIFeatures = void 0;
const ai_1 = require("./services/ai");
async function demonstrateAIFeatures() {
    console.log('🚀 Cognivo AI Features Demo\n');
    try {
        const aiService = new ai_1.AIService();
        // Sample content for demonstration
        const sampleContent = `
      Machine Learning is a subset of artificial intelligence (AI) that focuses on the development of algorithms and statistical models that enable computer systems to improve their performance on a specific task through experience. Unlike traditional programming, where explicit instructions are given to solve a problem, machine learning algorithms learn patterns from data and make predictions or decisions.

      There are three main types of machine learning:
      1. Supervised Learning: Learning with labeled training data
      2. Unsupervised Learning: Finding patterns in data without labels
      3. Reinforcement Learning: Learning through interaction with an environment

      Machine learning is widely used in various applications such as image recognition, natural language processing, recommendation systems, and autonomous vehicles.
    `;
        console.log('📝 1. Generating Study Notes...');
        const noteOptions = {
            difficulty: 'medium',
            style: 'academic',
            language: 'en',
            includeExamples: true,
            includeQuestions: true,
            maxLength: 1500
        };
        const notes = await aiService.generateNotes(sampleContent, noteOptions);
        console.log('✅ Notes Generated:');
        console.log(`Title: ${notes.title}`);
        console.log(`Key Concepts: ${notes.keyConcepts.join(', ')}`);
        console.log(`Content Length: ${notes.content.length} characters`);
        console.log(`Confidence: ${(notes.confidence * 100).toFixed(1)}%\n`);
        console.log('📋 2. Generating Quiz...');
        const quizOptions = {
            questionCount: 3,
            difficulty: 'medium',
            questionTypes: ['multiple-choice', 'short-answer'],
            subject: 'Computer Science',
            language: 'en'
        };
        const quiz = await aiService.generateQuiz(sampleContent, quizOptions);
        console.log('✅ Quiz Generated:');
        console.log(`Title: ${quiz.title}`);
        console.log(`Total Questions: ${quiz.totalQuestions}`);
        console.log(`Difficulty: ${quiz.difficulty}`);
        console.log(`Estimated Time: ${quiz.estimatedTime} minutes\n`);
        console.log('❓ 3. Answering Questions...');
        const qaOptions = {
            context: sampleContent,
            language: 'en',
            includeSource: true,
            maxLength: 300
        };
        const answer = await aiService.answerQuestion('What are the three main types of machine learning?', sampleContent, qaOptions);
        console.log('✅ Question Answered:');
        console.log(`Answer: ${answer.answer}`);
        console.log(`Confidence: ${(answer.confidence * 100).toFixed(1)}%`);
        console.log(`Related Topics: ${answer.relatedTopics?.join(', ')}\n`);
        console.log('🌍 4. Translating Content...');
        const translation = await aiService.translateContent('Machine learning is a subset of artificial intelligence.', 'es', {
            targetLanguage: 'es',
            preserveFormatting: true,
            educationalOptimization: true,
            confidenceThreshold: 0.8
        });
        console.log('✅ Content Translated:');
        console.log(`Original: ${translation.originalText}`);
        console.log(`Translated: ${translation.translatedText}`);
        console.log(`Target Language: ${translation.targetLanguage}`);
        console.log(`Confidence: ${(translation.confidence * 100).toFixed(1)}%\n`);
        console.log('🃏 5. Generating Flashcards...');
        const flashcardOptions = {
            cardCount: 3,
            difficulty: 'medium',
            cardType: 'basic',
            language: 'en',
            includeImages: false,
            includeAudio: false,
            subject: 'Computer Science'
        };
        const flashcards = await aiService.generateFlashcards(sampleContent, flashcardOptions);
        console.log('✅ Flashcards Generated:');
        console.log(`Title: ${flashcards.title}`);
        console.log(`Total Cards: ${flashcards.totalCards}`);
        console.log(`Difficulty: ${flashcards.difficulty}`);
        console.log(`Estimated Study Time: ${flashcards.estimatedStudyTime} minutes`);
        console.log(`Sample Card: ${flashcards.cards[0]?.front} → ${flashcards.cards[0]?.back}\n`);
        console.log('🎉 Demo completed successfully!');
    }
    catch (error) {
        console.error('❌ Demo failed:', error);
        console.log('\n💡 Make sure to:');
        console.log('1. Set your OPENAI_API_KEY in the .env file');
        console.log('2. Install dependencies with: npm install');
        console.log('3. Build the project with: npm run build');
    }
}
exports.demonstrateAIFeatures = demonstrateAIFeatures;
// Run the demo if this file is executed directly
if (require.main === module) {
    demonstrateAIFeatures();
}
//# sourceMappingURL=test-example.js.map