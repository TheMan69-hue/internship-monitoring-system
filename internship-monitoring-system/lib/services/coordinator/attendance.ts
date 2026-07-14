import { createClient } from "@/lib/supabase/server";


export async function getAssignedAttendance() {

  const supabase = await createClient();


  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();


  if (!user) {
    throw new Error("User not authenticated");
  }


  const { data, error } = await supabase

    .from("attendance_logs")

    .select(`
      id,
      date,
      status,
      time_in,
      time_out,
      location,
      location_name_in,

      students (
        id,
        student_number,
        name,
        program,
        section
      )
    `)

    .order(
      "date",
      {
        ascending: false
      }
    );


  if (error) {
    throw error;
  }


  return data;
}

export async function getAttendanceSummary() {
  const supabase = await createClient();
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();

  if(!user){
    throw new Error("User not authenticated");
  }

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const {
    data,
    error
  } = await supabase
    .from("attendance_logs")
    .select(`
      status,
      date,
      students!inner(
        program,
        section
      )
    `)
    .eq(
      "date",
      today
    );

  if(error){
    throw error;
  }

  const summary = {
    present:0,
    late:0,
    absent:0
  };

  data.forEach((record)=>{
    const status = record.status.toLowerCase();

    if(status === "present"){
      summary.present++;
    }

    if(status === "late"){
      summary.late++;
    }

    if(status === "absent"){
      summary.absent++;
    }

  });


  return summary;

}