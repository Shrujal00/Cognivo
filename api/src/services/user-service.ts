// Import types directly from the file
import type { ProgressData, Badge, Activity, Recommendation } from '../types/user';

/**
 * Service to manage user progress and dashboard data
 */
export class UserService {
  /**
   * Fetch user progress data for the dashboard
   * @param userId User ID
   * @returns User progress data
   */
  async getUserProgress(userId: string): Promise<ProgressData> {
    // In a production app, this would fetch from a database
    // For now, return mock data
    
    return {
      roadmaps: {
        total: 3,
        completed: 1,
        inProgress: 2
      },
      quizzes: {
        total: 12,
        completed: 8,
        averageScore: 85
      },
      flashcards: {
        total: 50,
        mastered: 35
      },
      xp: 1250,
      level: 5,
      streak: 7,
      badges: [
        {
          id: 'first-roadmap',
          name: 'Pathfinder',
          description: 'Completed your first study roadmap',
          icon: '🗺️',
          earned: true,
          earnedDate: '2023-10-15'
        },
        {
          id: 'quiz-master',
          name: 'Quiz Master',
          description: 'Score 100% on 5 quizzes',
          icon: '🏆',
          earned: true,
          earnedDate: '2023-10-20'
        },
        {
          id: 'flash-genius',
          name: 'Flash Genius',
          description: 'Master 50 flashcards',
          icon: '⚡',
          earned: false
        },
        {
          id: 'streak-7',
          name: 'Weekly Warrior',
          description: 'Maintain a 7-day streak',
          icon: '🔥',
          earned: true,
          earnedDate: '2023-10-25'
        }
      ],
      recentActivities: [
        {
          id: '1',
          type: 'roadmap',
          action: 'started',
          title: 'JavaScript Advanced Concepts',
          date: '2023-10-26T14:30:00Z'
        },
        {
          id: '2',
          type: 'quiz',
          action: 'completed',
          title: 'React Fundamentals Quiz',
          date: '2023-10-25T10:15:00Z',
          score: 85
        },
        {
          id: '3',
          type: 'flashcard',
          action: 'reviewed',
          title: 'Python Data Structures',
          date: '2023-10-24T16:45:00Z',
          cardsReviewed: 25
        }
      ],
      recommendations: [
        {
          id: '1',
          type: 'roadmap',
          title: 'Continue your JavaScript Roadmap',
          description: "You're 60% through - keep going!",
          icon: '📈',
          link: '/roadmap'
        },
        {
          id: '2',
          type: 'flashcards',
          title: 'Review your Python Flashcards',
          description: '15 cards due for review today',
          icon: '🧠',
          link: '/flashcards'
        }
      ]
    };
  }

  /**
   * Update user streak
   * @param userId User ID
   * @returns Updated streak count
   */
  async updateUserStreak(userId: string): Promise<number> {
    // In a real app, this would check the last login and update streak accordingly
    return 7; // Mock return
  }

  /**
   * Add XP to user account
   * @param userId User ID
   * @param amount Amount of XP to add
   * @returns Updated XP and level
   */
  async addUserXP(userId: string, amount: number): Promise<{xp: number, level: number}> {
    // In a real app, this would update the user's XP in the database
    return {
      xp: 1250 + amount,
      level: 5
    };
  }

  /**
   * Check and award any new badges
   * @param userId User ID
   * @returns Newly earned badges, if any
   */
  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    // In a real app, this would check conditions and award new badges
    return []; // Mock return - no new badges
  }
}
