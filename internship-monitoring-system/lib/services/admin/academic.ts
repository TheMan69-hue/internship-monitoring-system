import { createClient } from "@/lib/supabase/client";
import type { SchoolYear } from "@/lib/types";

type DbSchoolYear = {
  id: string;
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
};

type DbSemester = {
  id: string;
  school_year_id: string | null;
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
};

export type AcademicYearOption = {
  value: string;
  label: string;
};

export type AcademicSemesterOption = {
  value: string;
  label: string;
};

export type AcademicPageData = {
  schoolYears: SchoolYear[];
  yearOptions: AcademicYearOption[];
  semesterOptions: AcademicSemesterOption[];
  activeSchoolYear: SchoolYear | null;
};

function normalizeSemesterName(value: string | null | undefined): SchoolYear["semester"] {
  const normalized = (value ?? "").toLowerCase();

  if (normalized.includes("summer")) {
    return "summer";
  }

  if (normalized.includes("second") || normalized.includes("2nd")) {
    return "2nd";
  }

  return "1st";
}

async function getCurrentAdminProfile() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  return profile.role;
}

export async function getAcademicPageData(): Promise<AcademicPageData> {
  const role = await getCurrentAdminProfile();

  if (role !== "admin") {
    return {
      schoolYears: [],
      yearOptions: [],
      semesterOptions: [],
      activeSchoolYear: null,
    };
  }

  const supabase = createClient();

  const { data: schoolYearsData, error: schoolYearsError } = await supabase
    .from("school_years")
    .select("id, name, start_date, end_date, is_active")
    .order("start_date", { ascending: true });

  if (schoolYearsError) {
    throw schoolYearsError;
  }

  const { data: semestersData, error: semestersError } = await supabase
    .from("semesters")
    .select("id, school_year_id, name, start_date, end_date, is_active")
    .order("start_date", { ascending: true });

  if (semestersError) {
    throw semestersError;
  }

  const schoolYears = (schoolYearsData ?? []) as DbSchoolYear[];
  const semesters = (semestersData ?? []) as DbSemester[];

  const schoolYearMap = new Map(schoolYears.map((year) => [year.id, year]));

  const mappedSchoolYears: SchoolYear[] = semesters.map((semester, index) => {
    const parentSchoolYear = semester.school_year_id
      ? schoolYearMap.get(semester.school_year_id)
      : undefined;

    return {
      id: index + 1,
      academicYear: parentSchoolYear?.name ?? "Unknown School Year",
      semester: normalizeSemesterName(semester.name),
      is_active: Boolean(semester.is_active),
      status: Boolean(semester.is_active) ? "active" : "inactive",
      startDate: semester.start_date ?? parentSchoolYear?.start_date ?? undefined,
      endDate: semester.end_date ?? parentSchoolYear?.end_date ?? undefined,
    };
  });

  const yearOptions: AcademicYearOption[] = schoolYears.map((year) => ({
    value: year.name ?? year.id,
    label: year.name ?? "Unnamed School Year",
  }));

  const semesterOptions: AcademicSemesterOption[] = semesters.map((semester) => ({
    value: semester.name ?? semester.id,
    label: semester.name ?? "Unnamed Semester",
  }));

  const activeSchoolYear = schoolYears.find((year) => year.is_active)
    ? {
        id: 1,
        academicYear: schoolYears.find((year) => year.is_active)?.name ?? "",
        semester: "1st",
        is_active: true,
        status: "active" as const,
      }
    : null;

  return {
    schoolYears: mappedSchoolYears,
    yearOptions,
    semesterOptions,
    activeSchoolYear,
  };
}
