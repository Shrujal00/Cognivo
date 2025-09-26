import type { ProgressData, Badge } from '../types/user';
/**
 * Service to manage user progress and dashboard data
 */
export declare class UserService {
    /**
     * Fetch user progress data for the dashboard
     * @param userId User ID
     * @returns User progress data
     */
    getUserProgress(userId: string): Promise<ProgressData>;
    /**
     * Update user streak
     * @param userId User ID
     * @returns Updated streak count
     */
    updateUserStreak(userId: string): Promise<number>;
    /**
     * Add XP to user account
     * @param userId User ID
     * @param amount Amount of XP to add
     * @returns Updated XP and level
     */
    addUserXP(userId: string, amount: number): Promise<{
        xp: number;
        level: number;
    }>;
    /**
     * Check and award any new badges
     * @param userId User ID
     * @returns Newly earned badges, if any
     */
    checkAndAwardBadges(userId: string): Promise<Badge[]>;
}
//# sourceMappingURL=user-service.d.ts.map