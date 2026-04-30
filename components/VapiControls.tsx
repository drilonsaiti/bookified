'use client'
import {Mic, MicOff} from "lucide-react";
import {IBook} from "@/types";
import useVapi from "@/hooks/useVapi";
import Image from 'next/image'
import Transcript from "@/components/Transcript";
import {cn} from "@/lib/utils";
import {useEffect} from "react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

const VapiControls = ({book}: { book: IBook }) => {
    const router = useRouter();
    const {
        status, isActive, messages, currentMessage, currentUserMessage, duration,
        start, stop, limitError, clearError, maxDurationSeconds
    } = useVapi(book);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusText = () => {
        if (!isActive) return 'Ready';
        switch (status) {
            case 'speaking': return 'Speaking...';
            case 'listening': return 'Listening...';
            case 'thinking': return 'Thinking...';
            case 'connecting': return 'Connecting...';
            case 'starting': return 'Starting...';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    useEffect(() => {
        if (limitError) {
            if (limitError.isBillingError) {
                toast.info(limitError.message, {
                    description: 'Redirecting to subscriptions...',
                });
                router.push('/subscriptions');
            } else {
                toast.error(limitError.message);
                router.push('/');
            }
            clearError();
        }
    }, [limitError, router, clearError]);

    return (
        <>
            {/* Header Card */}
            <div className="vapi-header-card w-full">
                <div className="vapi-cover-wrapper">
                    <Image
                        src={book.coverURL || '/images/book-placeholder.png'}
                        alt={book.title}
                        width={120}
                        height={180}
                        className="vapi-cover-image w-30! h-auto!"
                    />
                    <div className="vapi-mic-wrapper">
                        <button
                            onClick={isActive ? stop : start}
                            disabled={status === 'connecting'}
                            aria-label={isActive ? 'Stop voice assistant' : 'Start voice assistant'}
                            title={isActive ? 'Stop voice assistant' : 'Start voice assistant'}
                            className={cn(
                                "vapi-mic-btn shadow-md w-[60px]! h-[60px]! z-10",
                                isActive ? "vapi-mic-btn-active" : "vapi-mic-btn-inactive"
                            )}
                        >
                            {isActive ? (
                                <Mic className="size-7 text-white animate-pulse"/>
                            ) : (
                                <MicOff className="size-7 text-[#212a3b]"/>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 flex-1">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold font-serif text-[#212a3b]">
                            {book.title}
                        </h1>
                        <p className="text-[#3d485e]">by {book.author}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="vapi-status-indicator">
                            <span className={cn(
                                "vapi-status-dot",
                                !isActive ? "vapi-status-dot-ready" : `vapi-status-dot-${status}`
                            )}/>
                            <span className="vapi-status-text">
                                {getStatusText()}
                            </span>
                        </div>
                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">Voice: {book.persona || 'Daniel'}</span>
                        </div>
                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">{formatTime(duration)}/{formatTime(maxDurationSeconds)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="vapi-transcript-wrapper">
                <Transcript
                    messages={messages}
                    currentMessage={currentMessage}
                    currentUserMessage={currentUserMessage}
                />
            </div>
        </>

    )
}
export default VapiControls
