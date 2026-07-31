"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateCurrentUserProfile } from "@/lib/actions/profile";
import UserDetailsModal from "@/components/modals/UserDetailsModal";
import EditUserDetailsModal from "@/components/modals/EditUserDetailsModal";

type UserProfileModalProps = {
  role: "admin" | "coordinator";
  containerClassName?: string;
  buttonClassName?: string;
  buttonTextClassName?: string;
  buttonIconClassName?: string;
};

type AssignedSection = {
  id: string;
  label: string;
};

type ProfileState = {
  username: string;
  email: string;
  employeeNumber?: string | null;
  department?: string | null;
  assignedSections?: AssignedSection[];
};

export default function UserProfileModal({
  role,
  containerClassName = "",
  buttonClassName = "",
  buttonTextClassName = "",
  buttonIconClassName = "",
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || cancelled) {
          return;
        }

        const { data: profileRow } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("user_id", user.id)
          .maybeSingle();

        const username = profileRow?.full_name ?? user.user_metadata?.full_name ?? "User";
        const email = profileRow?.email ?? user.email ?? "";

        if (role === "coordinator" && profileRow?.id) {
          const { data: coordinatorRow } = await supabase
            .from("coordinators")
            .select("id, employee_number, department")
            .eq("profile_id", profileRow.id)
            .maybeSingle();

          const { data: assignmentRows } = await supabase
            .from("coordinator_assignments")
            .select("id, section, program")
            .eq("coordinator_id", coordinatorRow?.id ?? "")
            .order("program", { ascending: true })
            .order("section", { ascending: true });

          if (cancelled) {
            return;
          }

          setProfile({
            username,
            email,
            employeeNumber: coordinatorRow?.employee_number ?? "N/A",
            department: coordinatorRow?.department ?? "N/A",
            assignedSections: (assignmentRows ?? []).map((assignment) => ({
              id: assignment.id,
              label: `${assignment.program ?? "Unknown Program"} ${assignment.section ?? ""}`.trim(),
            })),
          });
          return;
        }

        if (!cancelled) {
          setProfile({
            username,
            email,
          });
        }
      } catch (loadError) {
        console.error("loadProfile error:", loadError);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [role]);

  const openDetails = () => {
    if (!profile) {
      return;
    }

    setErrorMessage("");
    setEditOpen(false);
    setDetailsOpen(true);
  };

  const openEdit = () => {
    setErrorMessage("");
    setDetailsOpen(false);
    setEditOpen(true);
  };

  const closeAll = () => {
    setErrorMessage("");
    setDetailsOpen(false);
    setEditOpen(false);
  };

  const handleSave = async (data: {
    username: string;
    email: string;
    password?: string;
  }) => {
    setSaving(true);
    setErrorMessage("");

    const result = await updateCurrentUserProfile(data);
    setSaving(false);

    if (!result.success) {
      setErrorMessage(result.message ?? "Failed to update user details.");
      return;
    }

    setProfile((current) =>
      current
        ? {
            ...current,
            username: data.username,
            email: data.email,
          }
        : current
    );
    setEditOpen(false);
    setDetailsOpen(true);
  };

  if (loading && !profile) {
    return (
      <div className={containerClassName}>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${buttonClassName}`}
          disabled
        >
          <User className={`h-5 w-5 text-gray-500 ${buttonIconClassName}`} />
          Loading...
        </button>
      </div>
    );
  }

  const buttonLabel = profile?.username ?? (role === "admin" ? "Admin" : "Coordinator");

  return (
    <div className={containerClassName}>
      <button
        type="button"
        onClick={openDetails}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 ${buttonClassName}`}
        aria-haspopup="dialog"
        aria-expanded={detailsOpen || editOpen}
      >
        <span className={buttonTextClassName}>{buttonLabel}</span>
        <User className={`h-5 w-5 text-gray-600 ${buttonIconClassName}`} />
      </button>

      {detailsOpen && profile && (
        <UserDetailsModal
          username={profile.username}
          email={profile.email}
          employeeNumber={profile.employeeNumber}
          department={profile.department}
          assignedSections={profile.assignedSections}
          onClose={closeAll}
          onEdit={openEdit}
        />
      )}

      {editOpen && profile && (
        <EditUserDetailsModal
          username={profile.username}
          email={profile.email}
          loading={saving}
          errorMessage={errorMessage}
          onClose={() => {
            setEditOpen(false);
            setDetailsOpen(true);
            setErrorMessage("");
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}