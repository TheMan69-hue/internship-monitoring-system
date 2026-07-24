"use client";

import { useState, useEffect } from 'react';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import AddNewProgram from '@/components/modals/AddNewProgram';
import { getPrograms } from '@/lib/services/admin/programs';
import {
  createProgram,
  updateProgram,
  deleteProgram,
} from '@/lib/actions/programs';

type AdminProgram = {
  id: string;
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
  const [actionLoading, setActionLoading] = useState(false);

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

  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

  const handleAdd = async (newData: Omit<AdminProgram, 'id'> & { id?: string }) => {
    setActionLoading(true);
    try {
      const result = await createProgram({
        program_name: newData.name,
        required_hours: newData.required_hours,
      });

      if (result.success) {
        await fetchData();
      } else {
        alert(result.message ?? 'Failed to create program.');
      }
    } finally {
      setActionLoading(false);
      setEditData(null);
    }
  };

  const handleEdit = async (newData: Omit<AdminProgram, 'id'> & { id?: string }) => {
    if (!newData.id) return;
    setActionLoading(true);
    try {
      const result = await updateProgram(String(newData.id), {
        program_name: newData.name,
        required_hours: newData.required_hours,
      });

      if (result.success) {
        await fetchData();
      } else {
        alert(result.message ?? 'Failed to update program.');
      }
    } finally {
      setActionLoading(false);
      setEditData(null);
    }
  };

  const handleEditClick = (row: AdminProgram) => {
    const confirmEdit = window.confirm(
      `Are you sure you want to edit "${row.name}"?`
    );
    if (!confirmEdit) return;
    setEditData(row);
    setShowModal(true);
  };

  const handleDelete = async (row: AdminProgram) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${row.name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const result = await deleteProgram(String(row.id));

      if (result.success) {
        await fetchData();
      } else {
        alert(result.message ?? 'Failed to delete program.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className=" flex flex-col flex-1 h-full p-5">
      <div className='flex flex-row justify-between items-center text-black mb-5'>
        <h1>Program List</h1>
      </div>
      <TableLayout<AdminProgram> title='Programs' buttonTitle='+' data={Data} onClick={() => { setEditData(null); setShowModal(true); }}>
        {(pagedData) => (
          <ReusableTable
            data={pagedData}
            isLoading={isLoading || actionLoading}
            columns={['name', 'required_hours', 'Total_Interns', 'Total_Coordinator']}
            showActions
            actions={[
              { label: 'Edit', onClick: (row) => handleEditClick(row) },
              { label: 'Delete', onClick: (row) => handleDelete(row) },
            ]}
          />
        )}
      </TableLayout>
      {showModal && (
        <AddNewProgram
          key={editData?.id ?? 'new'}
          show={showModal}
          onSubmit={editData ? handleEdit : handleAdd}
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
