import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import {getAllBooks} from "@/lib/actions/book.actions";
import Search from "@/components/Search";

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: Promise<{ query?: string }>;
}

const Page = async ({ searchParams }: Props) => {
    const { query } = await searchParams;
    const bookResults = await getAllBooks(query);
    const books = bookResults.success ? bookResults.books ?? [] : []
    return (
        <main className="wrapper container">
            <HeroSection/>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <h2 className="text-3xl font-bold font-serif text-[#212a3b]">Recent Books</h2>
                <Search />
            </div>

            <div className="library-books-grid">
                {books.map((book) => (
                    <BookCard
                        key={book._id}
                        title={book.title}
                        author={book.author}
                        coverURL={book.coverURL}
                        slug={book.slug}
                    />
                ))}
            </div>

        </main>
    )
}

export default Page
