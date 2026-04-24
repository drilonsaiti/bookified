'use server'

import {CreateBook, TextSegment} from "@/types";
import {connectToDatabase} from "@/database/mongoose";
import {generateSlug, serializeData} from "@/lib/utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";

export const getAllBooks = async () => {
    try {
        await connectToDatabase();

        const books = await Book.find().sort({createdAt: -1}).lean();

        return {
            success:true,
            books: serializeData(books)
        }

    } catch (error) {
        console.error('Error connecting to database:', error);
        return {
            success: false,
            error
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
    }catch (error) {
        console.error('Error connecting to database:', error);
        return {
            success: false,
            error
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
    } catch (e) {
        console.error('Error connecting to database:', e);
        return {
            success: false,
            error: e
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
    } catch (error) {
        console.error('Error connecting to database:', error);
        return {
            exists: false,
            error
        }
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(data.title);

        const existingBook = await Book.findOne({slug}).lean();

        if (existingBook)
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true
            }

        const book = await Book.create({...data, slug, totalSegments: 0});

        return {
            success: true,
            data: serializeData(book)
        }

    } catch (error) {
        console.error('Error creating book:', error);
        return {
            success: false,
            error
        }
    }
}


export const saveBookSegments = async (bookId: string,clerkId: string, segments: TextSegment[]) => {

    try {
        await connectToDatabase();

        console.log('Saving book segments ...');

        const segmentToInsert = segments.map(segment => ({
            clerkId,
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

    } catch (error) {
        console.error('Error saving book segments:', error);
        await BookSegment.deleteMany({book: bookId});
        await Book.findByIdAndDelete(bookId);
        console.log('Deleted book segments and book due to failure to save segments.')
        return {
            success: false,
            error
        }
    }
}