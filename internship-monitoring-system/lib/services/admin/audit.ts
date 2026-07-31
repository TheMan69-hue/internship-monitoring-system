import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Writes an entry to the audit_logs table (FR 3.2.7).
 * Uses supabaseAdmin (service role) to bypass RLS and permission restrictions.
 * Fails silently so it never blocks the primary operation.
 *
 * @param action  - Short action identifier (e.g. "create_coordinator")
 * @param options - Optional: table_name, record_id, description for richer audit trail
 */
export async function writeAuditLog(
  action: string,
  options?: {
    table_name?: string;
    record_id?: string;
    description?: string;
  }
) {
  try {
    // Server client has the user's session cookies
    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();

    // Use supabaseAdmin for the profile lookup (bypasses RLS on profiles)
    let profileId: string | null = null;
    if (user?.id) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      profileId = profile?.id ?? null;
    }

    const { error } = await supabaseAdmin.from("audit_logs").insert({
      user_id: profileId,
      action,
      table_name: options?.table_name ?? null,
      record_id: null,
      description: options?.description ?? null,
    });

    if (error) {
      console.error("writeAuditLog error:", error);
    }
  } catch (err) {
    console.error("writeAuditLog exception:", err);
  }
}
