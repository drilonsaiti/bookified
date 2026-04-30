import { auth } from "@clerk/nextjs/server";
import { PlanType, PLAN_LIMITS } from "@/lib/subscription-constants";

export const getSubscription = async () => {
  const { has } = await auth();

  const isPro = has({ permission: "plan:pro" }) || has({ role: "pro" });
  const isStandard = has({ permission: "plan:standard" }) || has({ role: "standard" });

  const plan: PlanType = isPro ? "pro" : isStandard ? "standard" : "free";
  const limits = PLAN_LIMITS[plan];

  return {
    plan,
    limits,
    isPro,
    isStandard,
    isFree: !isPro && !isStandard,
  };
};
