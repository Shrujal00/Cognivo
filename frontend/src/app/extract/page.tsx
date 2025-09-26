'use client';

import React, { useState, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { apiService } from '@/lib/api';
import { ExtractedText } from '@/types/api';
import toast from 'react-hot-toast';

export default function ExtractPage() {
  const [extractedText, setExtractedText] = useState<ExtractedText | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    { type: 'PDF', extensions: ['.pdf'], mimeTypes: ['application/pdf'] },
    { type: 'Images', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'], mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'] },
    { type: 'Text', extensions: ['.txt'], mimeTypes: ['text/plain'] },
  ];

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Check file type
    const isSupported = supportedFormats.some(format => 
      format.mimeTypes.includes(file.type) || 
      format.extensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (!isSupported) {
      toast.error('Unsupported file type. Please upload PDF, image, or text files.');
      return;
    }

    setIsLoading(true);
    try {
      let response: ExtractedText;
      
      if (file.type === 'application/pdf') {
        response = await apiService.extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        response = await apiService.extractTextFromImage(file);
      } else {
        response = await apiService.extractText(file);
      }
      
      setExtractedText(response);
      toast.success('Text extracted successfully!');
    } catch (error) {
      console.error('Error extracting text:', error);
      toast.error('Failed to extract text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    });
  };

  const downloadAsText = () => {
    if (!extractedText) return;
    
    const blob = new Blob([extractedText.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    setExtractedText(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Text Extraction</h1>
            <p className="text-gray-400">
              Extract text from PDFs, images, and documents using AI-powered OCR
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Upload File</h2>
              
              {/* Drag and Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.txt"
                  className="hidden"
                />
                
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                    <p className="text-white font-medium">Extracting text...</p>
                    <p className="text-gray-400 text-sm">This may take a moment</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-white font-medium mb-2">
                      Drop files here or click to browse
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      Supports PDF, images (JPG, PNG, GIF, BMP), and text files
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                )}
              </div>

              {/* Supported Formats */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-3">Supported Formats</h3>
                <div className="grid grid-cols-1 gap-3">
                  {supportedFormats.map((format, index) => (
                    <div key={index} className="bg-gray-700 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{format.type}</span>
                        <span className="text-sm text-gray-400">
                          {format.extensions.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Extracted Text */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Extracted Text</h2>
                {extractedText && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(extractedText.text)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md"
                    >
                      Copy
                    </button>
                    <button
                      onClick={downloadAsText}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md"
                    >
                      Download
                    </button>
                    <button
                      onClick={clearResults}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {!extractedText ? (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Extracted text will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info */}
                  {extractedText.metadata && (
                    <div className="bg-gray-700 rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-300 mb-2">File Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">File Size:</span>
                          <span className="ml-2 text-white">
                            {formatFileSize(extractedText.metadata.fileSize)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <span className="ml-2 text-white">
                            {extractedText.metadata.mimeType}
                          </span>
                        </div>
                        {extractedText.metadata.pageCount && (
                          <div>
                            <span className="text-gray-400">Pages:</span>
                            <span className="ml-2 text-white">
                              {extractedText.metadata.pageCount}
                            </span>
                          </div>
                        )}
                        {extractedText.confidence && (
                          <div>
                            <span className="text-gray-400">Confidence:</span>
                            <span className="ml-2 text-white">
                              {Math.round(extractedText.confidence * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Extracted Text Content */}
                  <div className="bg-gray-700 rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-300">Content</h3>
                      <span className="text-xs text-gray-400">
                        {extractedText.text.length} characters, {extractedText.text.split(' ').length} words
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="text-gray-100 whitespace-pre-wrap leading-relaxed text-sm">
                        {extractedText.text || 'No text found in the uploaded file.'}
                      </div>
                    </div>
                  </div>

                  {/* Language Detection */}
                  {extractedText.language && (
                    <div className="bg-gray-700 rounded-md p-3">
                      <span className="text-sm text-gray-400">Detected Language:</span>
                      <span className="ml-2 text-white font-medium">
                        {extractedText.language.toUpperCase()}
                      </span>
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