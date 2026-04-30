'use client'
import {Mic, MicOff} from "lucide-react";
import {IBook} from "@/types";
import useVapi from "@/hooks/useVapi";
import Image from 'next/image'
import Transcript from "@/components/Transcript";
import {cn} from "@/lib/utils";

const VapiControls = ({book}: { book: IBook }) => {
    const {
        status, isActive, messages, currentMessage, currentUserMessage, duration,
        start, stop, clearErrors
    } = useVapi(book);

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
                            className={cn(
                                "vapi-mic-btn shadow-md w-[60px]! h-[60px]!",
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
                                isActive ? "vapi-status-dot-active" : "vapi-status-dot-ready"
                            )}/>
                            <span className="vapi-status-text">
                                {isActive ? status.charAt(0).toUpperCase() + status.slice(1) : 'Ready'}
                            </span>
                        </div>
                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">Voice: {book.persona || 'Daniel'}</span>
                        </div>
                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">0:00/15:00</span>
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
