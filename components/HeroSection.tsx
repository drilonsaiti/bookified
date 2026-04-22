import Image from "next/image";



const HeroSection = () => {
    return (
        <section className="wrapper pt-10 mb-20 md:mb-32">
            <div className="library-hero-card">
                <div className="library-hero-content">
                    {/* Left - Heading, Description, and Button */}
                    <div className="library-hero-text">
                        <h1 className="library-hero-title">Your Library</h1>
                        <p className="library-hero-description">
                            Convert your books into interactive AI conversations.
                            Listen, learn, and discuss your favorite reads.
                        </p>
                        <button className="library-cta-primary mt-2">
                            <span className="text-2xl font-light mr-1">+</span> Add new book
                        </button>
                    </div>

                    {/* Center - Illustration */}
                    <div className="library-hero-illustration-desktop">
                        <Image
                            src="/assets/hero-illustration.png"
                            alt="Vintage books and a globe"
                            width={400}
                            height={300}
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Right - Steps Card */}
                    <div className="library-steps-card min-w-[240px] shadow-soft-sm">
                        <div className="flex flex-col gap-5">
                            <div className="library-step-item">
                                <div className="library-step-number">1</div>
                                <div className="flex flex-col">
                                    <h3 className="library-step-title">Upload PDF</h3>
                                    <p className="library-step-description">Add your book file</p>
                                </div>
                            </div>
                            <div className="library-step-item">
                                <div className="library-step-number">2</div>
                                <div className="flex flex-col">
                                    <h3 className="library-step-title">AI Processing</h3>
                                    <p className="library-step-description">We analyze the content</p>
                                </div>
                            </div>
                            <div className="library-step-item">
                                <div className="library-step-number">3</div>
                                <div className="flex flex-col">
                                    <h3 className="library-step-title">Voice Chat</h3>
                                    <p className="library-step-description">Discuss with AI</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </section>
    )
}
export default HeroSection
