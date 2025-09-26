'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { apiService } from '@/lib/api';
import { FlashcardGenerationOptions, GeneratedFlashcardSet, Flashcard } from '@/types/api';
import toast from 'react-hot-toast';

interface StudyState {
  flashcardSet: GeneratedFlashcardSet | null;
  currentCardIndex: number;
  showAnswer: boolean;
  studiedCards: Set<string>;
  mode: 'study' | 'review';
}

export default function FlashcardsPage() {
  const [studyState, setStudyState] = useState<StudyState>({
    flashcardSet: null,
    currentCardIndex: 0,
    showAnswer: false,
    studiedCards: new Set(),
    mode: 'study',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [content, setContent] = useState('');
  const [formData, setFormData] = useState<FlashcardGenerationOptions>({
    cardCount: 10,
    difficulty: 'medium',
    cardType: 'basic',
    language: 'en',
    includeImages: false,
    includeAudio: false,
    subject: '',
  });

  const generateFlashcards = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content to create flashcards from');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.generateFlashcards(content, formData);
      setStudyState({
        flashcardSet: response,
        currentCardIndex: 0,
        showAnswer: false,
        studiedCards: new Set(),
        mode: 'study',
      });
      setShowForm(false);
      toast.success('Flashcards generated successfully!');
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('Failed to generate flashcards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    if (!studyState.flashcardSet) return;
    
    const nextIndex = (studyState.currentCardIndex + 1) % studyState.flashcardSet.cards.length;
    setStudyState(prev => ({
      ...prev,
      currentCardIndex: nextIndex,
      showAnswer: false,
    }));
  };

  const prevCard = () => {
    if (!studyState.flashcardSet) return;
    
    const prevIndex = studyState.currentCardIndex === 0 
      ? studyState.flashcardSet.cards.length - 1 
      : studyState.currentCardIndex - 1;
    setStudyState(prev => ({
      ...prev,
      currentCardIndex: prevIndex,
      showAnswer: false,
    }));
  };

  const flipCard = () => {
    setStudyState(prev => ({
      ...prev,
      showAnswer: !prev.showAnswer,
    }));
  };

  const markAsStudied = () => {
    if (!studyState.flashcardSet) return;
    
    const currentCard = studyState.flashcardSet.cards[studyState.currentCardIndex];
    setStudyState(prev => ({
      ...prev,
      studiedCards: new Set(Array.from(prev.studiedCards).concat(currentCard.id)),
    }));
    nextCard();
  };

  const shuffleCards = () => {
    if (!studyState.flashcardSet) return;
    
    const shuffledCards = [...studyState.flashcardSet.cards].sort(() => Math.random() - 0.5);
    setStudyState(prev => ({
      ...prev,
      flashcardSet: prev.flashcardSet ? {
        ...prev.flashcardSet,
        cards: shuffledCards,
      } : null,
      currentCardIndex: 0,
      showAnswer: false,
    }));
  };

  const resetProgress = () => {
    setStudyState(prev => ({
      ...prev,
      studiedCards: new Set(),
      currentCardIndex: 0,
      showAnswer: false,
    }));
  };

  const resetFlashcards = () => {
    setStudyState({
      flashcardSet: null,
      currentCardIndex: 0,
      showAnswer: false,
      studiedCards: new Set(),
      mode: 'study',
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
              <h2 className="text-2xl font-bold text-white mb-6">Generate AI Flashcards</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); generateFlashcards(); }} className="space-y-6">
                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Study Content *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your study material here (text, notes, definitions, etc.)"
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
                    placeholder="e.g., Biology, Spanish Vocabulary, Chemistry"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Card Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Cards
                    </label>
                    <select
                      value={formData.cardCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, cardCount: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value={5}>5 cards</option>
                      <option value={10}>10 cards</option>
                      <option value={15}>15 cards</option>
                      <option value={20}>20 cards</option>
                      <option value={30}>30 cards</option>
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

                {/* Card Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Card Type
                  </label>
                  <select
                    value={formData.cardType}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardType: e.target.value as any }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="basic">Basic (Question/Answer)</option>
                    <option value="cloze">Cloze (Fill in the blank)</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="image-based">Image-based</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Flashcards...
                    </div>
                  ) : (
                    'Generate Flashcards'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!studyState.flashcardSet) return null;

  const currentCard = studyState.flashcardSet.cards[studyState.currentCardIndex];
  const progress = ((studyState.currentCardIndex + 1) / studyState.flashcardSet.cards.length) * 100;
  const studiedProgress = (studyState.studiedCards.size / studyState.flashcardSet.cards.length) * 100;

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{studyState.flashcardSet.title}</h1>
                <p className="text-gray-400">{studyState.flashcardSet.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={shuffleCards}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
                >
                  Shuffle
                </button>
                <button
                  onClick={resetProgress}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
                >
                  Reset Progress
                </button>
                <button
                  onClick={resetFlashcards}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
                >
                  New Set
                </button>
              </div>
            </div>
            
            {/* Progress bars */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Card {studyState.currentCardIndex + 1} of {studyState.flashcardSet.cards.length}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Studied: {studyState.studiedCards.size} cards</span>
                  <span>{Math.round(studiedProgress)}% studied</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${studiedProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Flashcard */}
          <div className="flex justify-center mb-6">
            <div className="flashcard-container w-96 h-64 cursor-pointer" onClick={flipCard}>
              <div className={`flashcard-inner ${studyState.showAnswer ? 'flashcard-flipped' : ''}`}>
                {/* Front */}
                <div className="flashcard-front">
                  <div className="text-center">
                    <div className="text-lg font-medium text-white mb-4">
                      {currentCard.front}
                    </div>
                    <div className="text-sm text-gray-400">
                      Click to reveal answer
                    </div>
                  </div>
                </div>
                
                {/* Back */}
                <div className="flashcard-back">
                  <div className="text-center">
                    <div className="text-lg font-medium text-white mb-4">
                      {currentCard.back}
                    </div>
                    <div className="text-sm text-blue-200">
                      Click to go back
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Info */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  studyState.studiedCards.has(currentCard.id)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {studyState.studiedCards.has(currentCard.id) ? 'Studied' : 'Not studied'}
                </span>
                <span className="ml-2 px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-medium">
                  {currentCard.difficulty}
                </span>
                {currentCard.tags && currentCard.tags.length > 0 && (
                  <span className="ml-2 text-sm text-gray-400">
                    Tags: {currentCard.tags.join(', ')}
                  </span>
                )}
              </div>
            </div>
            
            {/* Hints */}
            {currentCard.hints && currentCard.hints.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-300 mb-1">Hints:</h4>
                <ul className="text-sm text-gray-400">
                  {currentCard.hints.map((hint, index) => (
                    <li key={index}>• {hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={prevCard}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors"
            >
              Previous
            </button>
            
            <button
              onClick={flipCard}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors"
            >
              {studyState.showAnswer ? 'Show Question' : 'Show Answer'}
            </button>
            
            {studyState.showAnswer && !studyState.studiedCards.has(currentCard.id) && (
              <button
                onClick={markAsStudied}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
              >
                Mark as Studied
              </button>
            )}
            
            <button
              onClick={nextCard}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}