'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { apiService } from '@/lib/api';
import { QuizGenerationOptions, GeneratedQuiz, QuizQuestion } from '@/types/api';
import toast from 'react-hot-toast';

interface QuizState {
  quiz: GeneratedQuiz | null;
  currentQuestionIndex: number;
  userAnswers: { [questionId: string]: string | string[] };
  showResults: boolean;
  score: number;
}

export default function QuizzesPage() {
  const [quizState, setQuizState] = useState<QuizState>({
    quiz: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    showResults: false,
    score: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [content, setContent] = useState('');
  const [formData, setFormData] = useState<QuizGenerationOptions>({
    questionCount: 5,
    difficulty: 'medium',
    questionTypes: ['multiple-choice'],
    subject: '',
    language: 'en',
  });

  const generateQuiz = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content to create a quiz from');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.generateQuiz(content, formData);
      setQuizState({
        quiz: response,
        currentQuestionIndex: 0,
        userAnswers: {},
        showResults: false,
        score: 0,
      });
      setShowForm(false);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setQuizState(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [questionId]: answer,
      },
    }));
  };

  const nextQuestion = () => {
    if (!quizState.quiz) return;
    
    if (quizState.currentQuestionIndex < quizState.quiz.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      submitQuiz();
    }
  };

  const prevQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  const submitQuiz = () => {
    if (!quizState.quiz) return;

    let correctAnswers = 0;
    quizState.quiz.questions.forEach(question => {
      const userAnswer = quizState.userAnswers[question.id];
      const correctAnswer = question.correctAnswer;
      
      if (Array.isArray(correctAnswer)) {
        if (Array.isArray(userAnswer) && 
            userAnswer.length === correctAnswer.length &&
            userAnswer.every(answer => correctAnswer.includes(answer))) {
          correctAnswers++;
        }
      } else {
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      }
    });

    const score = Math.round((correctAnswers / quizState.quiz.questions.length) * 100);
    
    setQuizState(prev => ({
      ...prev,
      showResults: true,
      score,
    }));
  };

  const resetQuiz = () => {
    setQuizState({
      quiz: null,
      currentQuestionIndex: 0,
      userAnswers: {},
      showResults: false,
      score: 0,
    });
    setShowForm(true);
    setContent('');
  };

  if (showForm) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Generate AI Quiz</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); generateQuiz(); }} className="space-y-6">
                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Study Content *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your study material here (text, notes, articles, etc.)"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent h-32 resize-none"
                    required
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Mathematics, Biology, History"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Quiz Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Questions
                    </label>
                    <select
                      value={formData.questionCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value={3}>3 questions</option>
                      <option value={5}>5 questions</option>
                      <option value={10}>10 questions</option>
                      <option value={15}>15 questions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Question Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Question Types
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'multiple-choice', label: 'Multiple Choice' },
                      { value: 'true-false', label: 'True/False' },
                      { value: 'short-answer', label: 'Short Answer' },
                      { value: 'cloze', label: 'Fill in the Blank' },
                    ].map((type) => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.questionTypes.includes(type.value as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                questionTypes: [...prev.questionTypes, type.value as any],
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                questionTypes: prev.questionTypes.filter(t => t !== type.value),
                              }));
                            }
                          }}
                          className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-300">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Quiz...
                    </div>
                  ) : (
                    'Generate Quiz'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (quizState.showResults && quizState.quiz) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h2>
              <div className="text-6xl font-bold text-primary-400 mb-4">{quizState.score}%</div>
              <p className="text-gray-300 mb-6">
                You got {Math.round((quizState.score / 100) * quizState.quiz.questions.length)} out of {quizState.quiz.questions.length} questions correct
              </p>
              
              {/* Results breakdown */}
              <div className="space-y-4 mb-6">
                {quizState.quiz.questions.map((question, index) => {
                  const userAnswer = quizState.userAnswers[question.id];
                  const isCorrect = Array.isArray(question.correctAnswer) 
                    ? Array.isArray(userAnswer) && userAnswer.every(a => question.correctAnswer.includes(a))
                    : userAnswer === question.correctAnswer;
                  
                  return (
                    <div key={question.id} className="bg-gray-700 p-4 rounded-lg text-left">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white mb-2">
                            {index + 1}. {question.question}
                          </p>
                          <p className="text-sm text-gray-400 mb-1">
                            Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                              {Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer || 'Not answered'}
                            </span>
                          </p>
                          <p className="text-sm text-gray-400">
                            Correct answer: <span className="text-green-400">
                              {Array.isArray(question.correctAnswer) 
                                ? question.correctAnswer.join(', ') 
                                : question.correctAnswer}
                            </span>
                          </p>
                          {question.explanation && (
                            <p className="text-sm text-gray-300 mt-2">{question.explanation}</p>
                          )}
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {isCorrect ? '✓' : '✗'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={resetQuiz}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Create New Quiz
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!quizState.quiz) return null;

  const currentQuestion = quizState.quiz.questions[quizState.currentQuestionIndex];
  const userAnswer = quizState.userAnswers[currentQuestion.id];
  const progress = ((quizState.currentQuestionIndex + 1) / quizState.quiz.questions.length) * 100;

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">{quizState.quiz.title}</h1>
              <button
                onClick={resetQuiz}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Question {quizState.currentQuestionIndex + 1} of {quizState.quiz.questions.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">{currentQuestion.question}</h2>
            
            {/* Multiple choice options */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = userAnswer === optionLabel;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, optionLabel)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-600 bg-opacity-20 text-white'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <span className="font-medium">{optionLabel}.</span> {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* True/False */}
            {currentQuestion.type === 'true-false' && (
              <div className="space-y-3">
                {['True', 'False'].map((option) => {
                  const isSelected = userAnswer === option;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-600 bg-opacity-20 text-white'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short answer */}
            {(currentQuestion.type === 'short-answer' || currentQuestion.type === 'cloze') && (
              <textarea
                value={userAnswer as string || ''}
                onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                placeholder="Enter your answer here..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24 resize-none"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={quizState.currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
            >
              Previous
            </button>
            
            <button
              onClick={nextQuestion}
              disabled={!userAnswer}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
            >
              {quizState.currentQuestionIndex === quizState.quiz.questions.length - 1 ? 'Submit Quiz' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}