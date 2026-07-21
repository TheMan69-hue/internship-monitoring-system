'use client';

export interface AuditLogs {
  date: string;
  time: string;
  user_id: string;
  action: string;
  status?: string;
};

interface AuditLogCardProps {
  title: string;
  data: AuditLogs[];
  isLoading?: boolean;
  onRowClick?: (AuditLog: AuditLogs) => void;
  columns?: (keyof AuditLogs)[];
};

const statusStyles = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  completed: 'bg-blue-100 text-blue-800',
};


export default function AuditLogCard({
  title,
  data,
  isLoading = false,
  onRowClick,
  columns = ['date', 'time', 'user_id', 'action', 'status'],
}: AuditLogCardProps) {
  return (
    <div className="h-full rounded-[20px] bg-white p-5 shadow-sm border border-[#E5E7EB]">

      <h2 className="mb-4 text-lg font-semibold text-[#111827]">
        {title}
      </h2>

      <div className="space-y-3">
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
            {data.map((AuditLog, idx) => (
              <tr
                key={AuditLog.user_id}
                onClick={() => onRowClick?.(AuditLog)}
                className={`border-t border-slate-200 ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-200 transition-colors' : ''
                } ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
              >
                {columns.map((col) => (
                  <td key={`${AuditLog.user_id}-${col}`} className="px-4 py-3 text-sm text-gray-700">
                    {col === 'status' ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusStyles[AuditLog[col] as keyof typeof statusStyles]
                        }`}
                      >
                        {String(AuditLog[col])}
                      </span>
                    ) : (
                      String(AuditLog[col] || '-')
                    )}
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