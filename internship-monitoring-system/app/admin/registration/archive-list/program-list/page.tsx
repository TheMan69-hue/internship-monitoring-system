"use client";

import { useState, useEffect } from 'react';
import { Program } from '@/lib/types';
import { mockProgramLists } from '@/lib/programList';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import AddNewProgram from '@/components/modals/AddNewProgram';

export default function Dashboard() {
  const [Data, setData] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Program | null>(null);

  // Fetch programs from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls to database
        setData(mockProgramLists);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create new entry or update existing
  const handleAdd = (newData: Omit<Program, 'id'> & { id?: number }) => {
    setData((prev) => {
      // If editing, replace the existing entry
      if (newData.id !== undefined) {
        return prev.map((item) => (item.id === newData.id ? newData as Program : item));
      }
      // If adding new, append
      const newId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
      return [...prev, { ...newData, id: newId } as Program];
    });
    setEditData(null);
  };
  
  // Update entry with confirmation
  const handleEdit = (row: Program) => {
    const confirmEdit = window.confirm(
      `Are you sure you want to edit "${row.name}"?`
    );
    if (!confirmEdit) return;
    setEditData(row);
    setShowModal(true);
  };

  // Delete entry with confirmation
  const handleDelete = (row: Program) => {
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
        <TableLayout<Program> title='Programs' buttonTitle='+'  data={Data} onClick={() => { setEditData(null); setShowModal(true); }}>
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