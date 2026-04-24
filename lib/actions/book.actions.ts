'use server'

import {CreateBook, TextSegment} from "@/types";
import {connectToDatabase} from "@/database/mongoose";
import {generateSlug, serializeData} from "@/lib/utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";
import {auth} from "@clerk/nextjs/server";

export const getAllBooks = async () => {
    try {
        await connectToDatabase();

        const books = await Book.find().sort({createdAt: -1}).lean();

        return {
            success:true,
            books: serializeData(books)
        }

    } catch (error: any) {
        console.error('Error connecting to database:', error);
        return {
            success: false,
            error: error?.message || String(error)
        }
    }
}

export const getBookById = async (id: string) => {
    try {
        await connectToDatabase();

        const book = await Book.findById(id).lean();

        return {
            success:true,
            book: serializeData(book)
        }
    }catch (error: any) {
        console.error('Error connecting to database:', error);
        return {
            success: false,
            error: error?.message || String(error)
        }
    }
}

export const getBookBySlug = async (slug: string) => {
    try {
        await connectToDatabase();

        const book = await Book.findOne({slug}).lean();
        return {
            success:true,
            book: serializeData(book)
        }
    } catch (e: any) {
        console.error('Error connecting to database:', e);
        return {
            success: false,
            error: e?.message || String(e)
        }
    }
}


export const checkBookExists = async (title: string) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(title);

        const existingBook = await Book.findOne({slug}).lean();

        if (existingBook){
            return {
                exists: true,
                book: serializeData(existingBook)
            }
        }

        return {
            exists: false,
        }
    } catch (error: any) {
        console.error('Error connecting to database:', error);
        return {
            exists: false,
            error: error?.message || String(error)
        }
    }
}

export const createBook = async (data: Omit<CreateBook, 'clerkId'>) => {
    try {
        const {userId} = await auth();

        if (!userId) {
            return {
                success: false,
                error: "Unauthorized"
            }
        }

        await connectToDatabase();

        const slug = generateSlug(data.title);

        const existingBook = await Book.findOne({slug}).lean();

        if (existingBook)
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true
            }

        const book = await Book.create({...data, clerkId: userId, slug, totalSegments: 0});

        return {
            success: true,
            data: serializeData(book)
        }

    } catch (error: any) {
        console.error('Error creating book:', error);
        return {
            success: false,
            error: error?.message || String(error)
        }
    }
}


export const saveBookSegments = async (bookId: string, segments: TextSegment[]) => {

    try {
        const {userId} = await auth();

        if (!userId) {
            return {
                success: false,
                error: "Unauthorized"
            }
        }

        await connectToDatabase();

        const book = await Book.findById(bookId);

        if (!book) {
            return {
                success: false,
                error: "Book not found"
            }
        }

        if (book.clerkId !== userId) {
            return {
                success: false,
                error: "Unauthorized: You do not own this book"
            }
        }

        console.log('Saving book segments ...');

        const segmentToInsert = segments.map(segment => ({
            clerkId: userId,
            bookId,
            content: segment.text,
            segmentIndex: segment.segmentIndex,
            pageNumber: segment.pageNumber,
            wordCount: segment.wordCount,
        }));

        await BookSegment.insertMany(segmentToInsert);

        await Book.findByIdAndUpdate(bookId, {totalSegments: segments.length});

        console.log('Book segments saved successfully.');

        return {
            success: true,
            data: {
                segmentsCreated: segments.length
            }
        }

    } catch (error: any) {
        console.error('Error saving book segments:', error);
        await BookSegment.deleteMany({book: bookId});
        await Book.findByIdAndDelete(bookId);
        console.log('Deleted book segments and book due to failure to save segments.')
        return {
            success: false,
            error: error?.message || String(error)
        }
    }
}