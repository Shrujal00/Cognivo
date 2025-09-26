'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { apiService } from '@/lib/api';
import { RoadmapGenerationOptions, StudyRoadmap, Task } from '@/types/api';
import toast from 'react-hot-toast';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<StudyRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState<RoadmapGenerationOptions>({
    subject: '',
    difficulty: 'beginner',
    duration: 4,
    hoursPerWeek: 10,
    learningStyle: 'visual',
    goals: [''],
    prerequisites: [''],
    language: 'en',
  });

  const handleInputChange = (field: keyof RoadmapGenerationOptions, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'goals' | 'prerequisites', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.map((item, i) => i === index ? value : item) || [],
    }));
  };

  const addArrayItem = (field: 'goals' | 'prerequisites') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), ''],
    }));
  };

  const removeArrayItem = (field: 'goals' | 'prerequisites', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || [],
    }));
  };

  const generateRoadmap = async () => {
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    setIsLoading(true);
    try {
      const options: RoadmapGenerationOptions = {
        ...formData,
        goals: formData.goals.filter(g => g.trim()),
        prerequisites: formData.prerequisites?.filter(p => p.trim()),
      };

      const response = await apiService.generateRoadmap(options);
      setRoadmap(response);
      setShowForm(false);
      toast.success('Roadmap generated successfully!');
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast.error('Failed to generate roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (milestoneId: string, taskId: string) => {
    if (!roadmap) return;
    
    setRoadmap(prev => {
      if (!prev) return null;
      return {
        ...prev,
        milestones: prev.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return {
              ...milestone,
              tasks: milestone.tasks?.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ) || [],
            };
          }
          return milestone;
        }),
      };
    });
  };

  if (showForm) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Generate Study Roadmap</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); generateRoadmap(); }} className="space-y-6">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="e.g., JavaScript Programming, Calculus, Biology"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Duration and Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (weeks)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hours per week
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={formData.hoursPerWeek}
                      onChange={(e) => handleInputChange('hoursPerWeek', parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Learning Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Learning Style
                  </label>
                  <select
                    value={formData.learningStyle}
                    onChange={(e) => handleInputChange('learningStyle', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="kinesthetic">Kinesthetic</option>
                    <option value="reading">Reading/Writing</option>
                  </select>
                </div>

                {/* Goals */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Learning Goals
                  </label>
                  {formData.goals.map((goal, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => handleArrayChange('goals', index, e.target.value)}
                        placeholder="Enter a learning goal"
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {formData.goals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('goals', index)}
                          className="ml-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('goals')}
                    className="text-primary-400 hover:text-primary-300 text-sm"
                  >
                    + Add another goal
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Roadmap...
                    </div>
                  ) : (
                    'Generate Study Roadmap'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!roadmap) return null;

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{roadmap.title}</h1>
              <p className="text-gray-400 mt-1">
                {roadmap.duration} weeks • {roadmap.totalHours} total hours • {roadmap.difficulty}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Generate New
            </button>
          </div>

          {/* Milestones */}
          <div className="space-y-6">
            {roadmap.milestones.map((milestone, index) => (
              <div key={milestone.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{milestone.title}</h3>
                    <p className="text-gray-400 mt-1">{milestone.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Week {milestone.week}</span>
                      <span>•</span>
                      <span>{milestone.estimatedHours} hours</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      Progress: {milestone.tasks?.filter(t => t.completed).length || 0}/{milestone.tasks?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Topics */}
                {milestone.topics.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Topics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {milestone.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {milestone.tasks && milestone.tasks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Tasks:</h4>
                    <div className="space-y-2">
                      {milestone.tasks.map((task) => (
                        <div key={task.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(milestone.id, task.id)}
                            className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                          />
                          <label className={`ml-3 text-sm ${
                            task.completed ? 'text-gray-500 line-through' : 'text-gray-300'
                          }`}>
                            {task.description}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {milestone.resources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Resources:</h4>
                    <ul className="space-y-1">
                      {milestone.resources.map((resource, i) => (
                        <li key={i} className="text-sm text-gray-400">
                          • {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* YouTube Resources */}
                {milestone.youtubeResources && milestone.youtubeResources.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Recommended Videos:</h4>
                    <div className="space-y-2">
                      {milestone.youtubeResources.map((video, i) => (
                        <div key={i} className="bg-gray-700 p-3 rounded">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 font-medium"
                          >
                            {video.title}
                          </a>
                          <p className="text-xs text-gray-400 mt-1">{video.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}