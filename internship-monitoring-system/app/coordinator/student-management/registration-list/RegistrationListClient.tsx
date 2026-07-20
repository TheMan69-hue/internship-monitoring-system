"use client";

import { useState } from "react";

import {
  registrationColumns,
} from "@/lib/data/registration";

import RegistrationDetailsModal from "@/components/modals/RegistrationDetailsModal";
import SearchInput from "@/components/search/SearchInput";
import DataTable from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { useRouter } from "next/navigation";
import ReasonModal from "@/components/modals/ReasonModal";
import ActionModal from "@/components/modals/ActionModal";

import {
  approveRegistrationAction,
  approveRegistrationsAction,
  rejectRegistrationAction,
  rejectRegistrationsAction,
} from "@/lib/actions/registrations";

type Registration = {
  id: string;
  student_number: string;
  name: string;
  program: string;
  section: string;
  phone_number: string;
  email_address: string;
  status: "Pending" | "Approved" | "Rejected";

  hte_companies: {
    id: string;
    company_name: string;
  }[] | null;
};


type RegistrationListClientProps = {
  registrations: Registration[];
};


export default function RegistrationListClient({
  registrations,
}: RegistrationListClientProps) {


  const [selectedStudents, setSelectedStudents] =
    useState<string[]>([]);


  const [programFilter, setProgramFilter] =
    useState("All");


  const [sectionFilter, setSectionFilter] =
    useState("All");


  const [search, setSearch] =
    useState("");


  const [selectedStudent, setSelectedStudent] =
    useState<Registration | null>(null);

  const [studentToReject, setStudentToReject] =
    useState<Registration | null>(null);
  
  const [showRejectModal, setShowRejectModal] =
    useState(false);

  const [bulkReject, setBulkReject] =
    useState(false);
  
  const [showActionModal, setShowActionModal] =
    useState(false);

  const [actionTitle, setActionTitle] =
    useState("");

  const [actionMessage, setActionMessage] =
    useState("");
    
  const [actionType, setActionType] =
    useState<
      "success" | "error" | "warning" | "info"
    >("success");

  const router = useRouter();

  const showMessage = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string
  ) => {

    setActionType(type);

    setActionTitle(title);

    setActionMessage(message);

    setShowActionModal(true);

  };

  const handleApprove = async () => {
    if (!selectedStudent) return;

    const result =
      await approveRegistrationAction(
        selectedStudent.id
      );

    if (!result.success) {
      showMessage(
        "error",
        "Error",
        result.message ?? "Something went wrong."
      );
      return;
    }

    setSelectedStudent(null);
    showMessage(
      "success",
      "Success",
      "Student approved successfully."
    );
    router.refresh();
  };

  const handleReject = async (
    reason: string
  ) => {

    if (!studentToReject) return;

    const result =
      await rejectRegistrationAction(
        studentToReject.id,
        reason
      );

    if (!result.success) {
      showMessage(
        "error",
        "Error",
        result.message ?? "Failed to reject registration."
      );
      return;
    }

    setShowRejectModal(false);
    setStudentToReject(null);
    showMessage(
      "success",
      "Registration Rejected",
      "The student's registration has been rejected successfully."
    );
    router.refresh();

  };

  const handleBulkReject = async (
    reason: string
  ) => {

    if (selectedStudents.length === 0) return;

    const result =
      await rejectRegistrationsAction(
        selectedStudents,
        reason
      );

    if (!result.success) {
      showMessage(
      "error",
      "Error",
      result.message ?? "Bulk rejection failed."
    );
      return;
    }

    setShowRejectModal(false);
    setSelectedStudents([]);
    setBulkReject(false);
    showMessage(
      "success",
      "Registrations Rejected",
      "Selected registrations have been rejected successfully."
    );
    router.refresh();
  };

  const filteredRegistrations =
    registrations.filter((student)=>{

      const matchesProgram =
        programFilter === "All" ||
        student.program === programFilter;


      const matchesSection =
        sectionFilter === "All" ||
        student.section === sectionFilter;


      const matchesSearch =
        student.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );


      return (
        matchesProgram &&
        matchesSection &&
        matchesSearch
      );

    });



  const programs = [
    "All",
    ...new Set(
      registrations.map(
        student => student.program
      )
    )
  ];


  const sections = [
    "All",
    ...new Set(
      registrations.map(
        student => student.section
      )
    )
  ];



  const allSelected =
    filteredRegistrations.length > 0 &&
    selectedStudents.length === filteredRegistrations.length;



  const handleSelectAll = () => {


    if(allSelected){

      setSelectedStudents([]);


    }else{


      setSelectedStudents(
        filteredRegistrations.map(
          student => student.id
        )
      );


    }

  };



  const handleSelectStudent = (
    id:string
  ) => {


    if(selectedStudents.includes(id)){


      setSelectedStudents(
        selectedStudents.filter(
          studentId =>
            studentId !== id
        )
      );


    }else{


      setSelectedStudents([
        ...selectedStudents,
        id
      ]);


    }

  };

  const handleBulkApprove = async () => {
    if (selectedStudents.length === 0) {
      showMessage(
      "warning",
      "No Selection",
      "Please select at least one student."
    );
      return;
    }

    const result = await approveRegistrationsAction(
      selectedStudents
    );

    if (!result.success) {
      alert(result.message);
      return;
    }

    showMessage(
      "success",
      "Students Approved",
      "Selected students have been approved successfully."
    );

    setSelectedStudents([]);

    router.refresh();

  };


  const columns = registrationColumns.map(
    column =>

      column.key === "select"

      ?

      {
        ...column,

        header:(

          <input

            type="checkbox"

            checked={allSelected}

            onChange={handleSelectAll}

            className="h-4 w-4 rounded border-[#D1D5DB]"

          />

        )

      }

      :

      column

  );



  return (

    <div className="rounded-[20px] bg-white p-6 shadow-sm">


      <h2 className="mb-6 text-3xl font-semibold text-[#111827]">
        Registration List
      </h2>



      <div className="mb-6 flex items-center justify-between">


        <div className="flex gap-4">


          <div>

            <label className="mb-1 block text-sm text-[#374151]">
              Program
            </label>


            <select

              value={programFilter}

              onChange={(e)=>
                setProgramFilter(
                  e.target.value
                )
              }

              className="w-40 rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-[#374151]"

            >

              {
                programs.map(
                  program => (

                    <option
                      key={program}
                      value={program}
                    >
                      {program}
                    </option>

                  )
                )
              }

            </select>


          </div>

          <div>

            <label className="mb-1 block text-sm text-[#374151]">
              Section
            </label>

            <select

              value={sectionFilter}

              onChange={(e)=>
                setSectionFilter(
                  e.target.value
                )
              }

              className="w-40 rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-[#374151]"

            >

              {
                sections.map(
                  section => (

                    <option
                      key={section}
                      value={section}
                    >
                      {section}
                    </option>

                  )
                )
              }

            </select>

          </div>

        </div>

        <SearchInput

          value={search}

          onChange={setSearch}

        />


      </div>

      <DataTable columns={columns}>


        {
          filteredRegistrations.map(
            student => (


              <tr

                key={student.id}

                onClick={() =>
                  setSelectedStudent(student)
                }

                className="cursor-pointer border-t text-[#374151] hover:bg-[#F3F4F6]"

              >


                <td className="px-6 py-4">
                  {student.program}
                </td>


                <td className="px-6 py-4">
                  {student.name}
                </td>


                <td className="px-6 py-4">
                  {student.section}
                </td>


                <td className="px-6 py-4">

                  {
                    student.hte_companies?.[0]
                    ?.company_name
                    ??
                    "No HTE"
                  }

                </td>



                <td className="px-6 py-4">

                  <StatusBadge
                    status={student.status}
                  />

                </td>



                <td className="px-6 py-4 text-center">


                  <input

                    type="checkbox"

                    checked={
                      selectedStudents.includes(
                        student.id
                      )
                    }


                    onClick={(e)=>
                      e.stopPropagation()
                    }


                    onChange={() =>
                      handleSelectStudent(
                        student.id
                      )
                    }


                    className="h-4 w-4 rounded border-[#D1D5DB]"

                  />


                </td>


              </tr>


            )
          )
        }

      </DataTable>

      <div className="mt-6 flex items-center justify-between">


        <p className="text-sm text-[#374151]">

          Showing {filteredRegistrations.length} entries

        </p>

        <div className="flex gap-3">

          <button
            onClick={handleBulkApprove}
            disabled={selectedStudents.length === 0}
            className="cursor-pointer rounded-lg bg-[#16A34A] px-5 py-2 text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#16A34A]"
          >
            Accept
          </button>

          <button
            onClick={() => {
              console.log("Bulk Reject Button Clicked");
              setBulkReject(true);
              setShowRejectModal(true);
            }}
            disabled={selectedStudents.length === 0}
            className="cursor-pointer rounded-lg bg-[#DC2626] px-5 py-2 text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#DC2626]"
          >
            Reject
          </button>


        </div>


      </div>

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
                ?.company_name
                ??
                "No HTE",
              status:
                selectedStudent.status,
            }}

            onClose={() =>
              setSelectedStudent(null)
            }

            onApprove={handleApprove}
            onReject={() => {
              setStudentToReject(selectedStudent);
              setSelectedStudent(null);
              setShowRejectModal(true);
            }}

          />

        )
      }
      
      {
        showRejectModal && 
        (bulkReject || studentToReject) && (

          <ReasonModal
            title={
              bulkReject
                ? "Reject Selected Registrations"
                : "Reject Registration"
            }

            placeholder="Enter rejection reason..."
            confirmText="Reject"
            onClose={() => {
              setShowRejectModal(false);
              setStudentToReject(null);
              setBulkReject(false);
            }}

            onConfirm={(reason) => {

              if (bulkReject) {
                handleBulkReject(reason);
              } else {
                handleReject(reason);
              }

            }}
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

    </div>

  );

}