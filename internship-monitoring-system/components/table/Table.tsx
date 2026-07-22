'use client';

import { useState } from 'react';
import { EllipsisVertical } from 'lucide-react';

interface ActionItem<T> {
  label: string | ((row: T) => string);
  onClick: (row: T) => void;
}

interface ReusableTableProps<T> {
  data: T[];
  columns: (keyof T)[];
  entriesPerPage?: number;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  actions?: ActionItem<T>[];
  showActions?: boolean;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
}

export default function ReusableTable<T extends { id?: string | number }>({
  data,
  columns,
  isLoading = false,
  onRowClick,
  actions,
  showActions = false,
  selectable = false,
  selectedIds: externalSelectedIds,
  onSelectionChange,
}: ReusableTableProps<T>) {
  const [menuOpen, setMenuOpen] = useState<number | string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | number)[]>([]);

  const selectedIds = externalSelectedIds ?? internalSelectedIds;

  const isAllSelected = data.length > 0 && data.every((row) => row.id !== undefined && selectedIds.includes(row.id));

  const toggleSelect = (id: string | number | undefined) => {
    if (id === undefined) return;
    const next = selectedIds.includes(id)
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id];
    if (onSelectionChange) {
      onSelectionChange(next);
    } else {
      setInternalSelectedIds(next);
    }
  };

  const toggleSelectAll = () => {
    const next = isAllSelected
      ? []
      : data.filter((row) => row.id !== undefined).map((row) => row.id as string | number);
    if (onSelectionChange) {
      onSelectionChange(next);
    } else {
      setInternalSelectedIds(next);
    }
  };

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
    <div className="border border-slate-200 rounded-md max-h-96 overflow-auto">
        <table className="w-full">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="accent-blue-600 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col)}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                  {String(col)
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim()}
                </th>
              ))}
              {actions && actions.length > 0 && showActions && <th className="px-4 py-3 text-sm font-semibold text-gray-700 w-16"><EllipsisVertical className="w-5 h-5 text-gray-600" /></th>}
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
                {selectable && (
                  <td className="px-4 py-3 text-sm text-gray-700" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={row.id !== undefined && selectedIds.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="accent-blue-600 cursor-pointer"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={`${row.id}-${String(col)}`} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {String(row[col] ?? '-')}
                  </td>
                ))}
                {actions && actions.length > 0 && showActions && (
                  <td className="px-4 py-3 text-sm text-gray-700" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setMenuPos({ top: rect.bottom + 4, left: rect.right - 176 });
                        setMenuOpen(menuOpen === row.id ? null : (row.id ?? null));
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <EllipsisVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    {menuOpen === row.id && menuPos && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => { setMenuOpen(null); setMenuPos(null); }} />
                        <div
                          className="fixed z-50 w-44 bg-white border border-gray-200 rounded-md shadow-lg"
                          style={{ top: menuPos.top, left: menuPos.left }}
                        >
                          {actions.map((action, i) => {
                            const actionLabel = typeof action.label === 'function' ? action.label(row) : action.label;
                            return (
                              <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); action.onClick(row); setMenuOpen(null); setMenuPos(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {actionLabel}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}
