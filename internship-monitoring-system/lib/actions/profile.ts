"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function updateCurrentUserProfile(data: {
  username: string;
  email: string;
  password?: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, message: "Not authenticated." };
    }

    const authUpdate: {
      email?: string;
      password?: string;
      user_metadata: {
        display_name: string;
        full_name: string;
      };
    } = {
      user_metadata: {
        display_name: data.username,
        full_name: data.username,
      },
    };

    const nextEmail = data.email.trim();
    if (nextEmail) {
      authUpdate.email = nextEmail;
    }

    const nextPassword = data.password?.trim();
    if (nextPassword) {
      authUpdate.password = nextPassword;
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      authUpdate
    );

    if (authError) {
      throw authError;
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: data.username,
        email: nextEmail,
      })
      .eq("user_id", user.id);

    if (profileError) {
      throw profileError;
    }

    return { success: true };
  } catch (error) {
    console.error("updateCurrentUserProfile error:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : "Failed to update profile.";
    return { success: false, message };
  }
}