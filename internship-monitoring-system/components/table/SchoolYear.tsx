'use client';

export interface SchoolYear {
  id: string;
  academicYear: string;
  semester: '1st' | '2nd' | 'summer';
  status: 'active' | 'inactive' | 'completed' | 'pending';
  section: string;
  startDate?: string;
  endDate?: string;
}

interface SchoolYearListsProps {
  data: SchoolYear[];
  isLoading?: boolean;
  onRowClick?: (SchoolYear: SchoolYear) => void;
  columns?: (keyof SchoolYear)[];
}

const statusStyles = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function SchoolYearLists({
  data,
  isLoading = false,
  onRowClick,
  columns = ['academicYear', 'semester', 'status'],
}: SchoolYearListsProps) {
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
        <p className="text-gray-500">No interns found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-md">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
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
          {data.map((SchoolYear, idx) => (
            <tr
              key={SchoolYear.id}
              onClick={() => onRowClick?.(SchoolYear)}
              className={`border-t border-slate-200 ${
                onRowClick ? 'cursor-pointer hover:bg-slate-200 transition-colors' : ''
              } ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
            >
              {columns.map((col) => (
                <td key={`${SchoolYear.id}-${col}`} className="px-4 py-3 text-sm text-gray-700">
                  {col === 'status' ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusStyles[SchoolYear[col] as keyof typeof statusStyles]
                      }`}
                    >
                      {String(SchoolYear[col])}
                    </span>
                  ) : (
                    String(SchoolYear[col] || '-')
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
