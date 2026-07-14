import { createClient } from "@/lib/supabase/server";


export async function getAssignedStudents() {

  const supabase = await createClient();


  // 1. Get logged-in user

  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();


  if (!user) {
    throw new Error("User not authenticated");
  }



  // 2. Find coordinator record

  // Get profile first

const {
  data: profile,
  error: profileError
} = await supabase
  .from("profiles")
  .select("id")
  .eq("user_id", user.id)
  .single();


if(profileError || !profile){
  throw new Error("Profile not found");
}


// Get coordinator record

const {
  data: coordinator,
  error: coordinatorError
} = await supabase
  .from("coordinators")
  .select("id")
  .eq("profile_id", profile.id)
  .single();



  if (coordinatorError || !coordinator) {
    throw new Error("Coordinator profile not found");
  }



  // 3. Get assigned programs and sections

  const {
    data: assignments,
    error: assignmentError
  } = await supabase
    .from("coordinator_assignments")
    .select(
      `
      program,
      section
      `
    )
    .eq(
      "coordinator_id",
      coordinator.id
    );



  if (assignmentError) {
    throw assignmentError;
  }



  if (!assignments || assignments.length === 0) {
    return [];
  }



  // 4. Fetch students matching assignments

  const {
    data: students,
    error: studentError
  } = await supabase
    .from("students")
    .select(
      `
      id,
      student_number,
      name,
      program,
      section,
      phone_number,
      email_address,

      hte_companies!students_hte_id_fkey (
        id,
        company_name,
        address,
        contact_person,
        contact_number,
        email,
        status
      )
      `
    )
    .or(
      assignments
        .map(
          (item) =>
            `and(program.eq.${item.program},section.eq.${item.section})`
        )
        .join(",")
    );



  if (studentError) {
  throw studentError;
}

return students ?? [];



  return students ?? [];

}