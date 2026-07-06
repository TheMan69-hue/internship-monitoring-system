type Column = {
  key: string;
  header: React.ReactNode;
};

type DataTableProps = {
  columns: Column[];
  children: React.ReactNode;
};

export default function DataTable({
  columns,
  children,
}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm">

      <div className="max-h-[420px] overflow-auto">

        <table className="min-w-full">

          <thead className="bg-[#F9FAFB]">

            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm font-semibold text-[#374151]"
                >
                  {column.header}
                </th>
              ))}
            </tr>

          </thead>

          <tbody>

            {children}

          </tbody>

        </table>

      </div>
    </div>
  );
}