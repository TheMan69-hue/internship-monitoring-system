"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type AuditLogEntry = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  description: string | null;
  created_at: string | null;
};

/**
 * Fetches the most recent 50 audit log entries.
 * Uses supabaseAdmin (service role) to bypass any RLS restrictions.
 */
export async function getAuditLogsAction(): Promise<AuditLogEntry[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("id, user_id, action, table_name, record_id, description, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("getAuditLogsAction error:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch display names for any user_ids that reference profiles
    const profileIds = data
      .map((r) => r.user_id)
      .filter((id): id is string => id != null)
      .filter((id, i, arr) => arr.indexOf(id) === i);

    const nameMap = new Map<string, string>();
    if (profileIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name")
        .in("id", profileIds);
      if (profiles) {
        for (const p of profiles) {
          nameMap.set(p.id, p.full_name ?? "Unknown");
        }
      }
    }

    return data.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      user_name: row.user_id ? (nameMap.get(row.user_id) ?? "Unknown") : null,
      action: row.action,
      table_name: row.table_name,
      record_id: row.record_id,
      description: row.description,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error("getAuditLogsAction exception:", err);
    return [];
  }
}
