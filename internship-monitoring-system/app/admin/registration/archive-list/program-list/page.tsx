"use client";

import { useState, useEffect } from 'react';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import AddNewProgram from '@/components/modals/AddNewProgram';
import { getPrograms } from '@/lib/services/admin/programs';

type AdminProgram = {
  id: number;
  name: string;
  required_hours: number;
  Total_Interns?: number;
  Total_Coordinator?: number;
};

export default function Dashboard() {
  const [Data, setData] = useState<AdminProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<AdminProgram | null>(null);

  // Fetch programs from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const programs = await getPrograms();
        setData(programs as unknown as AdminProgram[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create new entry or update existing
  const handleAdd = (newData: Omit<AdminProgram, 'id'> & { id?: number }) => {
    setData((prev) => {
      // If editing, replace the existing entry
      if (newData.id !== undefined) {
        return prev.map((item) => (item.id === newData.id ? { ...item, ...newData, id: newData.id } as AdminProgram : item));
      }
      // If adding new, append
      const newId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
      return [...prev, { ...newData, id: newId } as AdminProgram];
    });
    setEditData(null);
  };
  
  // Update entry with confirmation
  const handleEdit = (row: AdminProgram) => {
    const confirmEdit = window.confirm(
      `Are you sure you want to edit "${row.name}"?`
    );
    if (!confirmEdit) return;
    setEditData(row);
    setShowModal(true);
  };

  // Delete entry with confirmation
  const handleDelete = (row: AdminProgram) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${row.name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;
    setData((prev) => prev.filter((item) => item.id !== row.id));
  };

  return (
    <main className=" flex flex-col flex-1 h-full p-5">
        <div className='flex flex-row justify-between items-center text-black mb-5'>
          <h1>Program List</h1>
        </div>
        <TableLayout<AdminProgram> title='Programs' buttonTitle='+'  data={Data} onClick={() => { setEditData(null); setShowModal(true); }}>
          {(pagedData) => (
            <ReusableTable
              data={pagedData} 
              isLoading={isLoading}
              columns={['name', 'required_hours', 'Total_Interns', 'Total_Coordinator']}
              showActions
              actions={[
                { label: 'Edit', onClick: (row) => handleEdit(row) },
                { label: 'Delete', onClick: (row) => handleDelete(row) },
              ]}
            />
          )}
        </TableLayout>
        {showModal && (
          <AddNewProgram
            key={editData?.id ?? 'new'}
            show={showModal}
            onSubmit={handleAdd}
            editData={editData}
            onClose={() => {
              setShowModal(false);
              setEditData(null);
            }}
          />
        )}
    </main>
  );
}