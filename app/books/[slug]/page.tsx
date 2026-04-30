import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { ArrowLeft, MicOff, Mic } from 'lucide-react';

import { getBookBySlug } from '@/lib/actions/book.actions';
import { cn } from '@/lib/utils';
import VapiControls from "@/components/VapiControls";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookDetailsPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { slug } = await params;
  const { success, book } = await getBookBySlug(slug);

  if (!success || !book) {
    redirect('/');
  }

  return (
    <div className="book-page-container">
      <Link href="/" className="back-btn-floating">
        <ArrowLeft className="w-6 h-6 text-[#212a3b]" />
      </Link>

      <div className="max-w-4xl mx-auto flex flex-col gap-8">


        {/* Transcript Area */}
        <VapiControls book={book}/>
      </div>
    </div>
  );
}
