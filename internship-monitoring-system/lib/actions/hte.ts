"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createHTEAction(data: {
  company_name: string;
  address: string;
  contact_person: string;
  contact_number: string;
  email: string;
}) {
  try {
    const { error } = await supabaseAdmin
      .from("hte_companies")
      .insert({
        company_name: data.company_name,
        address: data.address,
        contact_person: data.contact_person,
        contact_number: data.contact_number,
        email: data.email,
        status: "Active",
      });

    if (error) {
      throw error;
    }

    revalidatePath("/coordinator/hte-management");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create HTE.",
    };
  }
}

export async function updateHTEAction(
  hteId: string,
  data: {
    company_name: string;
    address: string;
    contact_person: string;
    contact_number: string;
    email: string;
  }
) {
  try {
    const { error } = await supabaseAdmin
      .from("hte_companies")
      .update({
        company_name: data.company_name,
        address: data.address,
        contact_person: data.contact_person,
        contact_number: data.contact_number,
        email: data.email,
      })
      .eq("id", hteId);

    if (error) {
      throw error;
    }

    revalidatePath("/coordinator/hte-management");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update HTE.",
    };
  }
}

export async function deleteHTEAction(hteId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("hte_companies")
      .delete()
      .eq("id", hteId);

    if (error) {
      throw error;
    }

    revalidatePath("/coordinator/hte-management");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete HTE.",
    };
  }
}
