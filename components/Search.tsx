'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const [query, setQuery] = useState(searchParams.get('query')?.toString() || '');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (query) {
                params.set('query', query);
            } else {
                params.delete('query');
            }
            replace(`${pathname}?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, pathname, replace]);

    return (
        <div className="library-search-wrapper">
            <SearchIcon className="ml-3 size-5 text-gray-400" />
            <input
                type="text"
                className="library-search-input"
                placeholder="Search books by title or author"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
};

export default Search;
