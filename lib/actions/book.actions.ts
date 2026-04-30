'use server'

import {CreateBook, CreateBookResult, TextSegment} from "@/types";
import {connectToDatabase} from "@/database/mongoose";
import {escapeRegex, generateSlug, serializeData} from "@/lib/utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";
import {auth} from "@clerk/nextjs/server";
import mongoose from "mongoose";
import {revalidatePath} from "next/cache";
import {getSubscription} from "@/lib/subscription";
import {del} from "@vercel/blob";

export const deleteBlobs = async (urls: string[]) => {
    try {
        const {userId} = await auth();

        if (!userId) {
            return {
                success: false,
                error: "Unauthorized"
            }
        }

        await del(urls);

        return {
            success: true
        }
    } catch (error: any) {
        console.error('Error deleting blobs:', error);
        return {
            success: false,
            error: error?.message || String(error)
        }
    }
}



export const checkUserQuota = async () => {
    try {
        const {userId} = await auth();

        if (!userId) {
            return {
                success: false,
                error: "Unauthorized"
            }
        }

        await connectToDatabase();

        const { plan, limits } = await getSubscription();
        const bookCount = await Book.countDocuments({ clerkId: userId });

        if (bookCount >= limits.maxBooks) {
            return {
                success: false,
                isBillingError: true,
                error: `Plan limit reached: Your current ${plan} plan allows up to ${limits.maxBooks} books. Please upgrade to add more.`
            }
        }

        return {
            success: true
        }
    } catch (error: any) {
        console.error('Error checking user quota:', error);
        return {
            success: false,
            error: error?.message || String(error)
        }
    }
}

export const getAllBooks = async (query?: string) => {
    try {
        await connectToDatabase();

        let filter = {};
        if (query) {
            const regex = new RegExp(query, 'i');
            filter = {
                $or: [
                    { title: { $regex: regex } },
                    { author: { $regex: regex } }
                ]
            };
        }

        const books = await Book.find(filter).sort({createdAt: -1}).lean();

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

export const createBook = async (data: Omit<CreateBook, 'clerkId'>): Promise<CreateBookResult> => {
    try {
        const {userId} = await auth();

        if (!userId) {
            return {
                success: false,
                error: "Unauthorized"
            }
        }

        await connectToDatabase();

        const { plan, limits } = await getSubscription();

        const bookCount = await Book.countDocuments({ clerkId: userId });

        if (bookCount >= limits.maxBooks) {
            return {
                success: false,
                isBillingError: true,
                error: `Plan limit reached: Your current ${plan} plan allows up to ${limits.maxBooks} books. Please upgrade to add more.`
            }
        }

        const slug = generateSlug(data.title);

        const existingBook = await Book.findOne({slug}).lean();

        if (existingBook)
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true
            }

        const book = await Book.create({...data, clerkId: userId, slug, totalSegments: 0});

        revalidatePath('/')

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

export const searchBookSegments = async (bookId: string, query: string, limit: number = 5) => {
    try {
        await connectToDatabase();
        const bookObjectId = new mongoose.Types.ObjectId(bookId);

        let segments:Record<string,unknown>[] = [];
         try {
            segments =  await BookSegment.find(
                 {
                     bookObjectId,
                     $text: { $search: query }
                 },
             )
                .select('_id bookId content segmentIndex pageNumber wordCount')
                 .sort({ score: { $meta: "textScore" } })
                 .limit(limit)
                 .lean();
         } catch {
             segments = [];
         }

         if (segments.length === 0){
             const keywords = query.split(/\s+/).filter((k) => k.length > 2);
             const pattern = keywords.map(escapeRegex).join('|');

             segments = await BookSegment.find({
                 bookId: bookObjectId,
                 content: {$regex: pattern,$options: 'i'}
             })
                 .select('_id bookId content segmentIndex pageNumber wordCount')
                 .sort({segmentIndex: 1})
                 .limit(limit)
                 .lean();
         }

        return {
            success: true,
            segments: serializeData(segments)
        };
    } catch (error: any) {
        console.error('Error searching book segments:', error);
        return {
            success: false,
            error: error?.message || String(error),
            segments: []
        };
    }
}