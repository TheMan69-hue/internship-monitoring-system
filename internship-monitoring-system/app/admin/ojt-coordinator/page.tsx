"use client";

import { useState, useEffect } from 'react';
import { Coordinator } from '@/lib/types';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import AddNewCoordinator from '@/components/modals/AddNewCoordinator';
import { getCoordinators, getSectionOptions } from '@/lib/services/admin/coordinators';

export default function Dashboard() {
  const [Data, setData] = useState<Coordinator[]>([]);
  const [sectionOptions, setSectionOptions] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Coordinator | null>(null);

  // Fetch coordinators from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coordinators, sections] = await Promise.all([
          getCoordinators(),
          getSectionOptions(),
        ]);
        setData(coordinators);
        setSectionOptions(sections);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create new entry or update existing
  const handleAdd = (newData: Omit<Coordinator, 'id' | 'password'> & { id?: number; sections?: number[]; password?: string }) => {
    setData((prev) => {
      if (newData.id !== undefined) {
        return prev.map((item) => (item.id === newData.id ? newData as Coordinator : item));
      }
      const newId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
      return [...prev, { ...newData, id: newId } as Coordinator];
    });
    setEditData(null);
  };
  
  // Update entry with confirmation
  const handleEdit = (row: Coordinator) => {
    const confirmEdit = window.confirm(
      `Are you sure you want to edit "${row.name}"?`
    );
    if (!confirmEdit) return;
    setEditData(row);
    setShowModal(true);
  };

  // Delete entry with confirmation
  const handleDelete = (row: Coordinator) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${row.name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;
    setData((prev) => prev.filter((item) => item.id !== row.id));
  };

  return (
    <main className=" flex flex-col flex-1 h-full p-5">
        <div className='flex flex-row justify-between items-center text-black mb-5'>
          <h1>OJT Coordinator List</h1>
        </div>
        <TableLayout<Coordinator> title='Coordinator List' buttonTitle='+'  data={Data} onClick={() => { setEditData(null); setShowModal(true); }}>
          {(pagedData) => (
            <ReusableTable
              data={pagedData} 
              isLoading={isLoading}
              columns={['name', 'email', 'contact_num']}
              showActions
              actions={[
                { label: 'Edit', onClick: (row) => handleEdit(row) },
                { label: 'Delete', onClick: (row) => handleDelete(row) },
              ]}
            />
          )}
        </TableLayout>
        {showModal && (
          <AddNewCoordinator
            key={editData?.id ?? 'new'}
            show={showModal}
            onSubmit={handleAdd}
            editData={editData}
            sectionOptions={sectionOptions}
            onClose={() => {
              setShowModal(false);
              setEditData(null);
            }}
          />
        )}
    </main>
  );
}