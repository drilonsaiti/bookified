'use server'

import {EndSessionResult, StartSessionResult} from '@/types';
import {connectToDatabase} from "@/database/mongoose";
import VoiceSession from "@/database/models/voice-session.model";
import {getCurrentBillingPeriodStart} from "@/lib/subscription-constants";
import {getSubscription} from "@/lib/subscription";
import {auth} from "@clerk/nextjs/server";



export const startVoiceSession = async (bookId: string): Promise<StartSessionResult> => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return {
                success: false,
                error: 'Unauthorized'
            }
        }

        await connectToDatabase();

        const { plan, limits } = await getSubscription();
        const periodStart = getCurrentBillingPeriodStart();

        const sessionCount = await VoiceSession.countDocuments({
            clerkId: userId,
            billingPeriodStart: periodStart
        });

        if (sessionCount >= limits.maxSessionsPerMonth) {
            return {
                success: false,
                error: `Monthly session limit reached: Your current ${plan} plan allows up to ${limits.maxSessionsPerMonth} sessions per month.`,
                isBillingError: true
            }
        }

        const session = await VoiceSession.create({
            clerkId: userId,
            bookId,
            startedAt: new Date(),
            billingPeriodStart: periodStart,
            durationSeconds: 0
        })

        return {
            success: true,
            sessionId: session._id.toString(),
            maxDurationMinutes: limits.maxDurationMinutes
        }

    } catch (e) {
        console.error('Error starting voice session',e)
        return {
            success: false,
            error: 'Failed to start voice session.Please try again later'
        }
    }
}

export const endVoiceSession = async (sessionId: string,durationSeconds: number): Promise<EndSessionResult> => {
    try {
        await connectToDatabase();

       const result =  await VoiceSession.findByIdAndUpdate(sessionId,{
            endedAt: new Date(),
            durationSeconds
        })

        if (!result) {
            return {
                success: false,
                error: 'Failed to find voice session',
            }
        }

        return {
            success: true,
        }

    } catch (e) {
        console.log('Error ending voice session',e)
        return {
            success: false,
            error: 'Failed to end voice session.Please try again later'
        }
    }
}