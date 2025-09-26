'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { apiService } from '@/lib/api';
import { NoteGenerationOptions, GeneratedNote } from '@/types/api';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const [formData, setFormData] = useState<NoteGenerationOptions>({
    difficulty: 'medium',
    style: 'academic',
    language: 'en',
    includeExamples: true,
    includeQuestions: true,
    maxLength: 2000,
  });

  const generateNotes = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content to generate notes from');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.generateNotes(content, formData);
      setGeneratedNote(response);
      toast.success('Notes generated successfully!');
    } catch (error) {
      console.error('Error generating notes:', error);
      toast.error('Failed to generate notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    });
  };

  const exportNotes = () => {
    if (!generatedNote) return;
    
    const content = `# ${generatedNote.title}

## Key Concepts
${generatedNote.keyConcepts.map(concept => `- ${concept}`).join('\n')}

## Content
${generatedNote.content}

${generatedNote.examples ? `## Examples
${generatedNote.examples.map(example => `- ${example}`).join('\n')}` : ''}

${generatedNote.studyQuestions ? `## Study Questions
${generatedNote.studyQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}` : ''}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Generate AI Study Notes</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); generateNotes(); }} className="space-y-6">
                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Study Content *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your source material here (articles, textbook chapters, lecture notes, etc.)"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent h-40 resize-none"
                    required
                  />
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Style
                      </label>
                      <select
                        value={formData.style}
                        onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value as any }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="academic">Academic</option>
                        <option value="casual">Casual</option>
                        <option value="detailed">Detailed</option>
                        <option value="summary">Summary</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Length (words)
                    </label>
                    <input
                      type="number"
                      min="500"
                      max="5000"
                      step="500"
                      value={formData.maxLength}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxLength: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.includeExamples}
                        onChange={(e) => setFormData(prev => ({ ...prev, includeExamples: e.target.checked }))}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">Include examples</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.includeQuestions}
                        onChange={(e) => setFormData(prev => ({ ...prev, includeQuestions: e.target.checked }))}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">Include study questions</span>
                    </label>
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
                      Generating Notes...
                    </div>
                  ) : (
                    'Generate Study Notes'
                  )}
                </button>
              </form>
            </div>

            {/* Generated Notes */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Generated Notes</h2>
                {generatedNote && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(generatedNote.content)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md"
                    >
                      Copy
                    </button>
                    <button
                      onClick={exportNotes}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md"
                    >
                      Export
                    </button>
                  </div>
                )}
              </div>

              {!generatedNote ? (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Generated notes will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{generatedNote.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Difficulty: {generatedNote.difficulty}</span>
                      <span>•</span>
                      <span>Confidence: {Math.round(generatedNote.confidence * 100)}%</span>
                    </div>
                  </div>

                  {/* Key Concepts */}
                  {generatedNote.keyConcepts.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Key Concepts</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedNote.keyConcepts.map((concept, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-600 bg-opacity-20 text-primary-300 text-sm rounded-full"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Notes</h4>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {generatedNote.content}
                      </div>
                    </div>
                  </div>

                  {/* Examples */}
                  {generatedNote.examples && generatedNote.examples.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Examples</h4>
                      <div className="space-y-2">
                        {generatedNote.examples.map((example, index) => (
                          <div key={index} className="bg-gray-700 p-3 rounded-md">
                            <p className="text-gray-300">{example}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Study Questions */}
                  {generatedNote.studyQuestions && generatedNote.studyQuestions.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Study Questions</h4>
                      <div className="space-y-2">
                        {generatedNote.studyQuestions.map((question, index) => (
                          <div key={index} className="bg-gray-700 p-3 rounded-md">
                            <p className="text-gray-300">
                              <span className="font-medium">{index + 1}.</span> {question}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}