export const PLANS = {
    FREE: 'free',
    STANDARD: 'standard',
    PRO: 'pro',
} as const;

export type PlanType = 'free' | 'standard' | 'pro';

export interface PlanLimit {
    maxBooks: number;
    maxSessionsPerMonth: number;
    maxDurationMinutes: number;
    hasSessionHistory: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimit> = {
    free: {
        maxBooks: 1,
        maxSessionsPerMonth: 5,
        maxDurationMinutes: 5,
        hasSessionHistory: false,
    },
    standard: {
        maxBooks: 10,
        maxSessionsPerMonth: 100,
        maxDurationMinutes: 15,
        hasSessionHistory: true,
    },
    pro: {
        maxBooks: 100,
        maxSessionsPerMonth: 999999, // unlimited
        maxDurationMinutes: 60,
        hasSessionHistory: true,
    },
};

export const getCurrentBillingPeriodStart = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};