'use client';
import { useAuth, useUser } from "@clerk/nextjs";
import { PLANS, PLAN_LIMITS, PlanType } from "@/lib/subscription-constants";

export const useSubscription = () => {
  const { has, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const isLoaded = isAuthLoaded && isUserLoaded;

  if (!isLoaded) {
    return {
      plan: PLANS.FREE as PlanType,
      limits: PLAN_LIMITS[PLANS.FREE],
      isLoaded: false,
      isPro: false,
      isStandard: false,
      isFree: true,
    };
  }

  let plan: PlanType = PLANS.FREE;

  if (has?.({ plan: 'pro' })) {
    plan = PLANS.PRO;
  } else if (has?.({ plan: 'standard' })) {
    plan = PLANS.STANDARD;
  }

  return {
    plan,
    limits: PLAN_LIMITS[plan],
    isLoaded: true,
    isPro: plan === PLANS.PRO,
    isStandard: plan === PLANS.STANDARD,
    isFree: plan === PLANS.FREE,
  };
};