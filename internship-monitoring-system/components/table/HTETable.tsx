import type { HTE } from "@/lib/types";

type HTETableProps = {
  data: HTE[];
  onRowClick: (hte: HTE) => void;
};

export default function HTETable({
  data,
  onRowClick,
}: HTETableProps){
  return (
    <div className="overflow-hidden rounded-[16px] border bg-white shadow-sm">

      <table className="w-full">

        <thead className="bg-[#F3F4F6]">

          <tr>

            <th className="px-6 py-4 text-left text-[#374151]">
              Company Name
            </th>

            <th className="px-6 py-4 text-left text-[#374151]">
              Address
            </th>

            <th className="px-6 py-4 text-center text-[#374151]">
              Current Interns
            </th>

          </tr>

        </thead>

        <tbody>

          {data.map((hte) => (

            <tr
                key={hte.id}
                onClick={() => onRowClick(hte)}
                className="cursor-pointer border-t transition-colors duration-200 hover:bg-[#F3F4F6]"
            >

              <td className="px-6 py-4 text-[#374151]">
                {hte.company}
              </td>

              <td className="px-6 py-4 text-[#374151]">
                {hte.address}
              </td>

              <td className="px-6 py-4 text-center text-[#374151]">
                {hte.interns}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}