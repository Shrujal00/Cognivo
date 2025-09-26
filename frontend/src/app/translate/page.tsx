'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { apiService } from '@/lib/api';
import { TranslationOptions, TranslationResult } from '@/types/api';
import toast from 'react-hot-toast';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

export default function TranslatePage() {
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [options, setOptions] = useState<TranslationOptions>({
    targetLanguage: 'es',
    preserveFormatting: true,
    educationalOptimization: true,
    confidenceThreshold: 0.8,
  });

  const translateContent = async () => {
    if (!sourceText.trim()) {
      toast.error('Please enter some text to translate');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.translateContent(sourceText, targetLanguage, {
        ...options,
        targetLanguage,
      });
      setTranslationResult(response);
      toast.success('Translation completed successfully!');
    } catch (error) {
      console.error('Error translating content:', error);
      toast.error('Failed to translate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    });
  };

  const swapLanguages = () => {
    if (translationResult) {
      setSourceText(translationResult.translatedText);
      setTranslationResult(null);
    }
  };

  const clearAll = () => {
    setSourceText('');
    setTranslationResult(null);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">AI Translation</h1>
            <p className="text-gray-400">
              Translate educational content with context-aware AI optimization
            </p>
          </div>

          {/* Translation Settings */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Translation Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => {
                    setTargetLanguage(e.target.value);
                    setOptions(prev => ({ ...prev, targetLanguage: e.target.value }));
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confidence Threshold
                </label>
                <select
                  value={options.confidenceThreshold}
                  onChange={(e) => setOptions(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={0.6}>Low (60%)</option>
                  <option value={0.8}>Medium (80%)</option>
                  <option value={0.9}>High (90%)</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={swapLanguages}
                  disabled={!translationResult}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Swap Languages
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.preserveFormatting}
                  onChange={(e) => setOptions(prev => ({ ...prev, preserveFormatting: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-300">Preserve formatting</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.educationalOptimization}
                  onChange={(e) => setOptions(prev => ({ ...prev, educationalOptimization: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-300">Educational terminology optimization</span>
              </label>
            </div>
          </div>

          {/* Translation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Text */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Source Text</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={clearAll}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => copyToClipboard(sourceText)}
                    disabled={!sourceText}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-sm rounded-md"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent h-80 resize-none"
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-400">
                  {sourceText.length} characters
                </div>
                <button
                  onClick={translateContent}
                  disabled={isLoading || !sourceText.trim()}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Translating...
                    </div>
                  ) : (
                    'Translate'
                  )}
                </button>
              </div>
            </div>

            {/* Translated Text */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Translation {translationResult && (
                    <span className="text-sm font-normal text-gray-400">
                      ({languages.find(l => l.code === translationResult.targetLanguage)?.name})
                    </span>
                  )}
                </h3>
                {translationResult && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(translationResult.translatedText)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>

              {!translationResult ? (
                <div className="flex items-center justify-center h-80 text-gray-400">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <p>Translation will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Translation Quality */}
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                    <span className="text-sm text-gray-300">Translation Quality</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            translationResult.confidence >= 0.8 ? 'bg-green-500' : 
                            translationResult.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${translationResult.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white font-medium">
                        {Math.round(translationResult.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Translated Text */}
                  <div className="bg-gray-700 rounded-md p-4 h-64 overflow-y-auto">
                    <div className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                      {translationResult.translatedText}
                    </div>
                  </div>

                  {/* Educational Terms */}
                  {translationResult.educationalTerms && Object.keys(translationResult.educationalTerms).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Educational Terms</h4>
                      <div className="bg-gray-700 rounded-md p-3">
                        <div className="space-y-1 text-sm">
                          {Object.entries(translationResult.educationalTerms).map(([original, translated]) => (
                            <div key={original} className="flex justify-between">
                              <span className="text-gray-300">{original}</span>
                              <span className="text-primary-300">{translated}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-400">
                    {translationResult.translatedText.length} characters • 
                    Preserved formatting: {translationResult.preservedFormatting ? 'Yes' : 'No'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}