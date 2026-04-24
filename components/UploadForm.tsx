'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { UploadSchema } from '@/lib/zod';
import { BookUploadFormValues } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {ACCEPTED_IMAGE_TYPES, ACCEPTED_PDF_TYPES, DEFAULT_VOICE} from '@/lib/constants';
import LoadingOverlay from './LoadingOverlay';
import {cn, parsePDFFile} from '@/lib/utils';
import VoiceSelector from "@/components/VoiceSelector";
import FileUploader from "@/components/FileUploader";
import {useAuth} from "@clerk/react";
import {toast} from "sonner";
import {checkBookExists, createBook, saveBookSegments} from "@/lib/actions/book.actions";
import {useRouter} from "next/navigation";
import {upload} from "@vercel/blob/client";

const UploadForm = () => {
    const { userId,getToken } = useAuth();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const [pdfName, setPdfName] = useState<string | null>(null);
    const [coverName, setCoverName] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<BookUploadFormValues>({
        resolver: zodResolver(UploadSchema),
        defaultValues: {
            title: '',
            author: '',
            persona: DEFAULT_VOICE,
            pdfFile: undefined,
            coverImage: undefined,
        },
    });

    const onSubmit = async (data: BookUploadFormValues) => {
        if (!userId) {
            return toast.error('Please log in to upload a book.');
        }

        setIsSubmitting(true);

        try {
            const token = await getToken();
            const existsCheck = await checkBookExists(data.title);

            if (existsCheck.exists && existsCheck.book) {
                toast.info('Book already exists. Please choose a different title.');
                form.reset();
                router.push(`/books/${existsCheck.book.slug}`);

                return;
            }

            console.log()

            const fileTitle = data.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
            const pdfFile = data.pdfFile as File;

            const parsedPDF = await parsePDFFile(pdfFile);

            if (parsedPDF.content.length === 0) {
                toast.error('PDF is empty. Please upload a valid PDF file.');
                return;
            }

            const uploadedPdfBlob = await upload(fileTitle,pdfFile,{
                access: 'public',
                handleUploadUrl: `/api/upload?token=${token}`,
                contentType: 'application/pdf',
            });

            let coverURL: string;

            if (data.coverImage && data.coverImage.length > 0) {
                const coverFile = data.coverImage[0] as File;
                const coverBlob = await upload(`${fileTitle}_cover.png`,coverFile,{
                    access: 'public',
                    handleUploadUrl: `/api/upload?token=${token}`,
                    contentType: coverFile.type,
                });
                coverURL = coverBlob.url;
            }else {
                const response = await fetch(parsedPDF.cover);
                const blob = await response.blob();

                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`,blob,{
                    access: 'public',
                    handleUploadUrl: `/api/upload?token=${token}`,
                    contentType: 'image/png',
                })
                coverURL = uploadedCoverBlob.url;
            }

            const book = await createBook({
                clerkId: userId,
                title: data.title,
                author: data.author,
                persona: data.persona,
                fileURL: uploadedPdfBlob.url,
                fileBlobKey: uploadedPdfBlob.pathname,
                coverURL,
                fileSize: pdfFile.size
            })

            if (!book.success) {
                toast.error('Failed to upload book. Please try again.');
                throw new Error('Failed to create book');
            }

            if (book.alreadyExists) {
                toast.info('Book already exists. Please choose a different title.');
                form.reset();
                router.push(`/books/${existsCheck.book.slug}`);

                return;
            }

            const segments = await saveBookSegments(book.data._id,userId,parsedPDF.content);

            if (!segments.success) {
                toast.error('Failed to save book segments. Please try again.');
                throw new Error('Failed to save book segments');
            }

            form.reset();
            router.push('/');

        } catch (error) {
            console.error(error);

            toast.error('Failed to upload book. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) return null;

    return (
        <>
            {isSubmitting && <LoadingOverlay />}

            <div className="new-book-wrapper">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* 1. PDF File Upload */}
                        <FileUploader
                            control={form.control}
                            name="pdfFile"
                            label="Book PDF File"
                            acceptTypes={ACCEPTED_PDF_TYPES}
                            icon={Upload}
                            placeholder="Click to upload PDF"
                            hint="PDF file (max 50MB)"
                            disabled={isSubmitting}
                        />

                        {/* 2. Cover Image Upload */}
                        <FileUploader
                            control={form.control}
                            name="coverImage"
                            label="Cover Image (Optional)"
                            acceptTypes={ACCEPTED_IMAGE_TYPES}
                            icon={ImageIcon}
                            placeholder="Click to upload cover image"
                            hint="Leave empty to auto-generate from PDF"
                            disabled={isSubmitting}
                        />
                        {/* 3. Title Input */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="form-input"
                                            placeholder="ex: Rich Dad Poor Dad"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 4. Author Input */}
                        <FormField
                            control={form.control}
                            name="author"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Author Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="form-input"
                                            placeholder="ex: Robert Kiyosaki"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 5. Voice Selector */}
                        <FormField
                            control={form.control}
                            name="persona"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                                    <FormControl>
                                        <VoiceSelector
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 6. Submit Button */}
                        <Button type="submit" className="form-btn w-full" disabled={isSubmitting}>
                            Begin Synthesis
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    );
};

export default UploadForm;
