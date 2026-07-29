"use client";

import { ReactNode, useState, useMemo } from "react";
import Button from '@/components/buttons/buttons';
import SearchInput from "@/components/search/SearchInput";

type TablelayoutProps<T> = {
  title?: string;
  buttonTitle?: string;
  ButtonIcon?: ReactNode;
  showButton?: boolean;
  data: T[];
  entriesPerPage?: number;
  children: (pagedData: T[]) => ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  /** Keys to search on — if provided, shows a functional search bar */
  searchKeys?: (keyof T)[];
}

export default function TableLayout<T extends object>({
  title,
  buttonTitle,
  ButtonIcon,
  showButton = false,
  children,
  onClick,
  data,
  entriesPerPage = 20,
  searchKeys,
}: TablelayoutProps<T>){
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchKeys || searchKeys.length === 0) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        return value != null && String(value).toLowerCase().includes(q);
      })
    );
  }, [data, searchQuery, searchKeys]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * entriesPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return(
    <div className="flex flex-col rounded-lg w-full bg-white border border-slate-200 p-5">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex w-full gap-5 items-center justify-between mb-5 flex-shrink-0">
          <div className="flex gap-5 items-center">
            <h1 className="text-black">{title}</h1>
            <div>
              {showButton && (
                <Button 
                icon={ButtonIcon}
                onClick={onClick}
                type="submit"
                variant="primary"
                size="sm"
                >{buttonTitle}</Button>
              )}
            </div>
          </div>
          {searchKeys && searchKeys.length > 0 && (
            <div> 
              <SearchInput
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search..."
              />
            </div>
          )}
        </div>
        <div className="w-full flex-1 min-h-0">
          {children(currentData)}
        </div>
        {/* Pagination controls */}
        <div className="flex items-center mt-3 px-2 text-black gap-5 mb-5 flex-shrink-0">

          <span className="text-sm text-slate-500">
            Page {safePage} of {totalPages}
          </span>
          <div>
            <button
              disabled={safePage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="text-slate-500 px-2 border rounded disabled:opacity-70"
            >
              Prev
            </button>
            <button
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="text-slate-500 px-2 border rounded disabled:opacity-70"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}