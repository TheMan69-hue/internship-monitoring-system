'use client';

import { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  id: number;
  name: string;
}

interface MultiSelectDropdownProps {
  options: DropdownOption[];
  selected: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
  label?: string;
}

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Select options',
  label,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filtered = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: number) => {
    const next = selected.includes(id)
      ? selected.filter((sid) => sid !== id)
      : [...selected, id];
    onChange(next);
  };

  const handleToggleOpen = () => {
    setOpen((prev) => {
      if (!prev) setSearch('');
      return !prev;
    });
  };

  const selectedLabels = options
    .filter((opt) => selected.includes(opt.id))
    .map((opt) => opt.name);

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="flex mb-2 block text-sm font-medium text-[#374151]">{label}</label>
      )}

      {/* Input field with chips inside + dropdown button on right */}
      <div className="relative">
        <div className="flex justify-between items-center gap-1 rounded-[10px] border border-[#D1D5DB] bg-white transition focus-within:border-[#2563EB]">
          {/* Chips + search input area (80%) */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 px-3 py-2">
            {/* Selected chips inside the input */}
            {selectedLabels.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full shrink-0"
              >
                {name}
                <button
                  type="button"
                  onClick={() => {
                    const opt = options.find((o) => o.name === name);
                    if (opt) toggle(opt.id);
                  }}
                  className="hover:text-blue-900 leading-none"
                >
                  &times;
                </button>
              </span>
            ))}

            {/* Search input - expands to fill remaining space */}
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => {
                e.stopPropagation();
                if (!open) handleToggleOpen();
              }}
              onFocus={() => {
                if (!open) handleToggleOpen();
              }}
              placeholder={selectedLabels.length > 0 ? '' : placeholder}
              className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-[#374151] placeholder:text-gray-400"
              style={{ width: '100%' }}
            />
          </div>

          {/* Dropdown toggle button (20%) */}
          <button
            type="button"
            onClick={handleToggleOpen}
            className="flex min-w-12 h-full flex items-center justify-center border-l border-[#D1D5DB] bg-white rounded-r-[10px] text-gray-500 hover:bg-gray-50 transition"
            aria-label={open ? 'Close options' : 'Open options'}
          >
            <svg
              className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-[#D1D5DB] rounded-[10px] shadow-lg">
            {/* Search input in dropdown */}
            

            {/* Options list */}
            <div className="max-h-20 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">No options found</p>
              ) : (
                filtered.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(opt.id)}
                      onChange={() => toggle(opt.id)}
                      className="accent-blue-600"
                    />
                    {opt.name}
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
