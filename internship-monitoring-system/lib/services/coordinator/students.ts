import { createClient } from "@/lib/supabase/server";

type StudentWithHTE = {
  id: string;
  student_number: string;
  name: string;

  program: {
    program_name: string;
  } | null;

  section: {
    section_name: string;
  } | null;

  phone_number: string;
  email_address: string;

  hte_companies: {
    id: string;
    company_name: string;
    address: string | null;
    contact_person: string | null;
    contact_number: string | null;
    email: string | null;
    status: string;
  } | null;

  student_work_schedules: {
    expected_time_in: string;
    expected_time_out: string;
    required_hours: number;
    grace_minutes: number;
  } | null;
};

export async function getAssignedStudents() {

  const supabase = await createClient();

  // Get logged in user
  const {
    data:{
      user
    }
  } = await supabase.auth.getUser();

  if(!user){
    throw new Error("User not authenticated");
  }

  // Get profile

  const {
    data:profile,
    error:profileError
  } = await supabase
    .from("profiles")
    .select("id")
    .eq(
      "user_id",
      user.id
    )
    .single();

  if(profileError || !profile){
    throw new Error("Profile not found");
  }

  // Get coordinator

  const {
    data:coordinator,
    error:coordinatorError
  } = await supabase
    .from("coordinators")
    .select("id")
    .eq(
      "profile_id",
      profile.id
    )
    .single();

  if(coordinatorError || !coordinator){
    throw new Error("Coordinator not found");
  }

  // Get coordinator assignments

  const {
    data:assignments,
    error:assignmentError
  } = await supabase
    .from("coordinator_assignments")
    .select(`
      program_id,
      section_id
    `)
    .eq(
      "coordinator_id",
      coordinator.id
    );

  if(assignmentError){
    throw assignmentError;
  }

  if(!assignments || assignments.length === 0){
    return [];
  }

  const programIds =
    assignments.map(
      item=>item.program_id
    );


  const sectionIds =
    assignments.map(
      item=>item.section_id
    );

  // Get students

  const {
    data:students,
    error:studentError
  } = await supabase
    .from("students")
    .select(`
      id,
      student_number,
      name,

      program:programs(
        program_name
      ),

      section:sections(
        section_name
      ),

      phone_number,
      email_address,

      hte_companies!students_hte_id_fkey(
        id,
        company_name,
        address,
        contact_person,
        contact_number,
        email,
        status
      ),

      student_work_schedules!student_work_schedules_student_id_fkey(
        expected_time_in,
        expected_time_out,
        required_hours,
        grace_minutes
      )
    `)
    .in(
      "program_id",
      programIds
    )
    .in(
      "section_id",
      sectionIds
    );

  if(studentError){
    console.log(
      "STUDENT QUERY ERROR:",
      studentError
    );

    throw studentError;
  }
  console.log(
    JSON.stringify(students, null, 2)
  );
  console.log("Student count:", students?.length);
  
  const mappedStudents = ((students ?? []) as unknown as StudentWithHTE[])
  .map((student) => ({

    id: student.id,

    studentNumber: student.student_number,

    name: student.name,

    program:
      student.program?.program_name ??
      "Unknown",

    section:
      student.section?.section_name ??
      "Unknown",

    email:
      student.email_address,

    contactNumber:
      student.phone_number,

    hte:
      student.hte_companies
        ? {
            id: student.hte_companies.id,
            companyName: student.hte_companies.company_name,
            address: student.hte_companies.address,
            contactPerson: student.hte_companies.contact_person,
            contactNumber: student.hte_companies.contact_number,
            email: student.hte_companies.email,
            status: student.hte_companies.status,
          }
        : null,

    schedule:
      student.student_work_schedules
        ? {
            expectedTimeIn:
              student.student_work_schedules.expected_time_in,

            expectedTimeOut:
              student.student_work_schedules.expected_time_out,

            requiredHours:
              student.student_work_schedules.required_hours,

            graceMinutes:
              student.student_work_schedules.grace_minutes,
          }
        : null,

  }));

console.log(
  "MAPPED STUDENTS:",
  JSON.stringify(mappedStudents, null, 2)
);

return mappedStudents;
  return ((students ?? []) as unknown as StudentWithHTE[])
    .map(
      (student)=>({

        id:
          student.id,

        studentNumber:
          student.student_number,

        name:
          student.name,

        program:
          student.program?.program_name
          ??
          "Unknown",

        section:
          student.section?.section_name
          ??
          "Unknown",

        email:
          student.email_address,

        contactNumber:
          student.phone_number,

        hte:
          student.hte_companies
          ?
          {
            id:
              student.hte_companies.id,
            companyName:
              student.hte_companies.company_name,
            address:
              student.hte_companies.address,
            contactPerson:
              student.hte_companies.contact_person,
            contactNumber:
              student.hte_companies.contact_number,
            email:
              student.hte_companies.email,
            status:
              student.hte_companies.status,

          }

          :

          null,

        schedule:
          student.student_work_schedules
            ? {
                expectedTimeIn:
                  student.student_work_schedules.expected_time_in,

                expectedTimeOut:
                  student.student_work_schedules.expected_time_out,

                requiredHours:
                  student.student_work_schedules.required_hours,

                graceMinutes:
                  student.student_work_schedules.grace_minutes,
              }
            : null,

      })
    );

}