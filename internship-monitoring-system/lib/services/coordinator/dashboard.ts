import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();
  // Get current user

  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get profile

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

  // Get coordinator

  const {
    data: coordinator,
    error: coordinatorError
  } = await supabase
    .from("coordinators")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if(coordinatorError || !coordinator){
    throw new Error("Coordinator profile not found");
  }

  // Get assigned programs/sections

  const {
    data: assignments,
    error: assignmentError
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

    return {

      totalStudents: 0,
      totalHTE: 0,
      studentsWithoutHTE: 0,
      pendingInternship: 0

    };

  }

  // Get assigned students

  const programIds = assignments.map(
    item => item.program_id
  );

  const sectionIds = assignments.map(
    item => item.section_id
  );

  const {
    data: students,
    error: studentError
  } = await supabase
    .from("students")
    .select(`
      id,
      hte_id
    `)
    .in("program_id", programIds)
    .in("section_id", sectionIds);



  if(studentError){
    throw studentError;
  }

  const studentList = students ?? [];
  // Total HTE (global masterlist)

  const {
    count: totalHTE,
    error: hteError
  } = await supabase
    .from("hte_companies")
    .select("*", {
      count:"exact",
      head:true
    });

  if(hteError){
    throw hteError;
  }
  return {

    totalStudents:
      studentList.length,

    totalHTE:
      totalHTE ?? 0,

    studentsWithoutHTE:
      studentList.filter(
        student => student.hte_id === null
      ).length,
      
    // placeholder until internship table exists
    pendingInternship: 0

  };

}