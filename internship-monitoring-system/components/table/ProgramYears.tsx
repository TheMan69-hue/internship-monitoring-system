'use client';

export interface Intern {
  id: string;
  programs: string;
  internHours: Intern;
  enrolled: Intern;
  totalCoordinator: Intern;
}

interface StudentListsProps {
  data: Intern[];
  isLoading?: boolean;
  onRowClick?: (intern: Intern) => void;
  columns?: (keyof Intern)[];
}

const statusStyles = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  completed: 'bg-blue-100 text-blue-800',
} as const;

function getStatusStyle(status: string | undefined) {
  return statusStyles[status as keyof typeof statusStyles] ?? statusStyles.inactive;
}

export default function StudentLists({
  data,
  isLoading = false,
  onRowClick,
  columns = ['programs', 'internHours', 'enrolled', 'totalCoordinator'],
}: StudentListsProps) {
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
          {data.map((intern, idx) => (
            <tr
              key={intern.id}
              onClick={() => onRowClick?.(intern)}
              className={`border-t border-slate-200 ${
                onRowClick ? 'cursor-pointer hover:bg-slate-200 transition-colors' : ''
              } ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
            >
              {columns.map((col) => (
                <td key={`${intern.id}-${col}`} className="px-4 py-3 text-sm text-gray-700">
                  {col === 'totalCoordinator' ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(String(intern[col] ?? 'inactive'))}`}
                    >
                      {String(intern[col])}
                    </span>
                  ) : (
                    String(intern[col] || '-')
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
