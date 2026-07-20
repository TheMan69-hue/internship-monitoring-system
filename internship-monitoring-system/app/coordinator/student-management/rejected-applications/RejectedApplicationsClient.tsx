"use client";

import { useState } from "react";

import SearchBar from "@/components/search/SearchBar";
import DataTable from "@/components/table/DataTable";
import RegistrationDetailsModal from "@/components/modals/RegistrationDetailsModal";
import ActionModal from "@/components/modals/ActionModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

import {
  rejectedApplicationColumns,
} from "@/lib/data/rejectedApplications";

import { useRouter } from "next/navigation";

import {
  restoreRegistrationAction,
  deleteRejectedRegistrationAction,
} from "@/lib/actions/registrations";

type RejectedStudent = {
  id: string;
  student_number: string;
  name: string;
  program: string;
  section: string;
  phone_number: string;
  email_address: string;
  rejection_reason: string;

  hte_companies: {
    id: string;
    company_name: string;
  }[] | null;
};

type RejectedApplicationsClientProps = {
  students: RejectedStudent[];
};

export default function RejectedApplicationsClient({
  students,
}: RejectedApplicationsClientProps) {

  const [selectedStudent, setSelectedStudent] =
    useState<RejectedStudent | null>(null);

  const router = useRouter();
  const [showActionModal, setShowActionModal] =
    useState(false);

  const [actionTitle, setActionTitle] =
    useState("");

  const [actionMessage, setActionMessage] =
    useState("");

  const [actionType, setActionType] =
    useState<"success" | "error">(
      "success"
    );
  
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
   useState(false);
  
  const showMessage = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {

    setActionType(type);

    setActionTitle(title);

    setActionMessage(message);

    setShowActionModal(true);

  };

  const handleRestore = async () => {
    if (!selectedStudent) return;
    const result =
      await restoreRegistrationAction(
        selectedStudent.id
      );

    if (!result.success) {

      showMessage(
        "error",
        "Restore Failed",
        result.message ?? "Failed to restore registration."
      );
      return;
    }

    showMessage(
      "success",
      "Registration Restored",
      "The student registration has been restored successfully."
    );

    setSelectedStudent(null);

    router.refresh();

  };

  const handleDelete = async () => {

    if (!selectedStudent) return;

    const result =
      await deleteRejectedRegistrationAction(
        selectedStudent.id
      );

    if (!result.success) {

      showMessage(
        "error",
        "Delete Failed",
        result.message ?? "Failed to delete registration."
      );

      return;

    }

    showMessage(
      "success",
      "Registration Deleted",
      "The rejected registration has been permanently deleted."
    );

    setSelectedStudent(null);

    router.refresh();

  };

  return (

    <div className="rounded-[20px] bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-3xl font-semibold text-[#111827]">
        Rejected Applications
      </h2>

      <div className="mb-6 flex justify-end">
        <SearchBar />
      </div>

      <DataTable columns={rejectedApplicationColumns}>

        {students.map((student) => (

          <tr
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="cursor-pointer border-t transition hover:bg-[#F3F4F6]"
          >

            <td className="px-6 py-4 text-[#111827]">
              {student.student_number}
            </td>

            <td className="px-6 py-4 text-[#111827]">
              {student.program}
            </td>

            <td className="px-6 py-4 text-[#111827]">
              {student.name}
            </td>

            <td className="px-6 py-4 text-[#111827]">
              {student.section}
            </td>

            <td className="px-6 py-4 text-[#111827]">
              {
                student.hte_companies?.[0]
                  ?.company_name ??
                "No HTE"
              }
            </td>

          </tr>

        ))}

      </DataTable>

      {

        selectedStudent && (

          <RegistrationDetailsModal

            student={{

              id:
                Number(selectedStudent.id),

              studentNumber:
                selectedStudent.student_number,

              name:
                selectedStudent.name,

              program:
                selectedStudent.program,

              section:
                selectedStudent.section,

              email:
                selectedStudent.email_address,

              contactNumber:
                selectedStudent.phone_number,

              hte:
                selectedStudent.hte_companies?.[0]
                  ?.company_name ??
                "No HTE",

              status:
                "Rejected",

            }}

            onClose={() =>
              setSelectedStudent(null)
            }

            onApprove={handleRestore}
            onDelete={() =>
              setShowDeleteConfirmation(true)
            }
            showDelete={true}

          />

        )

      }

      <ActionModal
          open={showActionModal}
          type={actionType}
          title={actionTitle}
          message={actionMessage}
          onClose={() =>
            setShowActionModal(false)
          }
        />

      <ConfirmationModal
        open={showDeleteConfirmation}
        title="Delete Registration"
        message="Are you sure you want to permanently delete this rejected registration?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="#DC2626"
        onCancel={() =>
          setShowDeleteConfirmation(false)
        }
        onConfirm={async () => {

          setShowDeleteConfirmation(false);

          await handleDelete();

        }}
      />
        
    </div>

  );

}