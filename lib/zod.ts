import { z } from 'zod';
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_PDF_TYPES, MAX_FILE_SIZE, MAX_IMAGE_SIZE } from './constants';

export const UploadSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    author: z.string().min(1, 'Author is required').max(100),
    pdfFile: z
        .any()
        .refine((file) => file instanceof File, 'Book PDF is required')
        .refine((file) => file?.size <= MAX_FILE_SIZE, `File size must be less than 50MB`)
        .refine(
            (file) => ACCEPTED_PDF_TYPES.includes(file?.type),
            'Only .pdf formats are supported',
        ),
    coverImage: z
        .any()
        .optional()
        .refine((file) => !file || file instanceof File, 'Cover image must be a file')
        .refine(
            (file) => !file || file.size <= MAX_IMAGE_SIZE,
            `Image size must be less than 10MB`,
        )
        .refine(
            (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
            'Only .jpg, .jpeg, .png and .webp formats are supported',
        ),
    persona: z.string().min(1, 'Please select a voice'),
});
