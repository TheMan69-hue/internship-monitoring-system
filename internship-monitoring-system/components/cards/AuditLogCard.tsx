import { memo } from 'react';

export interface AuditLogs {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  description: string | null;
  created_at: string | null;
};

interface AuditLogCardProps {
  title: string;
  data: AuditLogs[];
  onRowClick?: (AuditLog: AuditLogs) => void;
  columns?: (keyof AuditLogs)[];
};

function formatTimestamp(ts: string | null): string {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const columnLabels: Partial<Record<keyof AuditLogs, string>> = {
  created_at: 'Date & Time',
  user_name: 'User',
  action: 'Action',
  table_name: 'Table',
  description: 'Description',
};

function AuditLogCard({
  title,
  data,
  onRowClick,
  columns = ['created_at', 'user_name', 'action', 'table_name', 'description'],
}: AuditLogCardProps) {
  return (
    <div className="h-full rounded-[20px] bg-white p-5 shadow-sm border border-[#E5E7EB]">

      <h2 className="mb-4 text-lg font-semibold text-[#111827]">
        {title}
      </h2>

      <div className="space-y-3 max-h-[200px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700"
                >
                  {columnLabels[col] ?? String(col)
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-400">
                  No audit entries yet
                </td>
              </tr>
            ) : (
              data.map((AuditLog, idx) => (
                <tr
                  key={AuditLog.id}
                  onClick={() => onRowClick?.(AuditLog)}
                  className={`border-t border-slate-200 ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-200 transition-colors' : ''
                  } ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                >
                  {columns.map((col) => (
                    <td key={`${AuditLog.id}-${col}`} className="px-2 py-1.5 text-xs text-gray-700">
                      {col === 'created_at'
                        ? formatTimestamp(AuditLog[col])
                        : String(AuditLog[col] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default memo(AuditLogCard);