"use Client";

import { ReactNode, useState } from "react";
import Button from '@/components/buttons/buttons';
import SearchBar from "@/components/search/SearchBar";

type TablelayoutProps<T> = {
  title: string;
  buttonTitle?: string;
  ButtonIcon?: ReactNode;
  data: T[];
  entriesPerPage?: number;
  children: (pagedData: T[]) => ReactNode;
  onClick?: () => void;
}

export default function TableLayout<T>({
  title,
  buttonTitle,
  ButtonIcon,
  children,
  onClick,
  data,
  entriesPerPage = 20,
}: TablelayoutProps<T>){
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const totalPages = Math.ceil(data.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = data.slice(startIndex, startIndex + entriesPerPage);

  return(
    <div className="flex rounded-lg w-full bg-white border border-slate-200 p-5">
      <div className="w-full">
        <div className="flex w-full gap-5 items-center justify-between mb-5">
          <div className="flex gap-5 items-center">
            <h1 className="text-black">{title}</h1>
            <div>
              <Button 
              icon={ButtonIcon}
              onClick={onClick}
              type="submit"
              variant="primary"
              size="sm"
              >{buttonTitle}</Button>
            </div>
          </div>
          <div> 
            <SearchBar/> 
          </div>
        </div>
        <div className="w-full mb-5 overflow-auto">
          {children(currentData)}
        </div>
        {/* Pagination controls */}
        <div className="flex items-center mt-3 px-2 text=black gap-5 mb-5">

          <span className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <div>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="text-slate-500 px-2 border rounded disabled:opacity-70"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
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