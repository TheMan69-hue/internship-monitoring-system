import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {

  const { registrationId } = await request.json();

  const supabase = await createClient();

  const { data: registration, error } = await supabase
    .from("student_registrations")
    .select(`
      id,
      email_address,
      status
    `)
    .eq("id", registrationId)
    .single();

  if (error || !registration) {
    return NextResponse.json(
      {
        error: "Registration not found",
      },
      {
        status: 404,
      }
    );
  }

  if (registration.status !== "Pending") {
    return NextResponse.json(
      {
        error: "Registration already processed",
      },
      {
        status: 400,
      }
    );
  }

  const { error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(
      registration.email_address
    );

  if (inviteError) {
    return NextResponse.json(
      {
        error: inviteError.message,
      },
      {
        status: 400,
      }
    );
  }

  const { error: updateError } = await supabase
    .from("student_registrations")
    .update({
      status: "Approved",
    })
    .eq("id", registrationId);

  if (updateError) {
    return NextResponse.json(
      {
        error: updateError.message,
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json({
    success: true,
  });

}