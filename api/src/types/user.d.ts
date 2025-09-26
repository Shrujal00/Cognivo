declare module '@/types/user' {
  export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: string;
  }
  
  export interface Activity {
    id: string;
    type: 'roadmap' | 'quiz' | 'flashcard' | 'chat';
    action: string;
    title: string;
    date: string;
    score?: number;
    cardsReviewed?: number;
  }
  
  export interface Recommendation {
    id: string;
    type: string;
    title: string;
    description: string;
    icon: string;
    link: string;
  }
  
  export interface ProgressData {
    roadmaps: {
      total: number;
      completed: number;
      inProgress: number;
    };
    quizzes: {
      total: number;
      completed: number;
      averageScore: number;
    };
    flashcards: {
      total: number;
      mastered: number;
    };
    xp: number;
    level: number;
    streak: number;
    badges: Badge[];
    recentActivities?: Activity[];
    recommendations?: Recommendation[];
  }
}
