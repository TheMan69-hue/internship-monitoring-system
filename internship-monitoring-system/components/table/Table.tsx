'use client';

import { useState } from 'react';

interface ReusableTableProps<T> {
  data: T[];
  columns: (keyof T)[];
  entriesPerPage?: number;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}

export default function ReusableTable<T extends { id?: string | number }>({
  data,
  columns,
  
  isLoading = false,
  onRowClick,
}: ReusableTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">No records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-md">
      {/* Scrollable table */}
      <div className=' overflow-y-auto  overflow-x-auto'>
        <table className="w-full">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col)}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  {String(col)
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                onClick={() => onRowClick?.(row)}
                className={`border-t border-slate-200 ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-200 transition-colors' : ''
                } ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
              >
                {columns.map((col) => (
                  <td key={`${row.id}-${String(col)}`} className="px-4 py-3 text-sm text-gray-700">
                    {String(row[col] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
