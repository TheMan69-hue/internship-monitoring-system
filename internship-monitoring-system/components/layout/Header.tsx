import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get logged-in user's profile
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Profile not found.");
  }

  // Get active school year
  const {
    data: schoolYear,
    error: schoolYearError,
  } = await supabase
    .from("school_years")
    .select("name")
    .eq("is_active", true)
    .single();

  if (schoolYearError) {
    console.error(schoolYearError);
  }

  return (
    <header className="bg-[#D9D9D9] border-b h-20 flex items-center justify-between px-8">
      <div>
        <h1 className="text-3xl font-bold text-[#000000]">
          Dashboard
        </h1>

        <p className="text-[#000000] text-gray-500">
          Hello, {profile.full_name}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Academic Year
        </p>

        <h2 className="font-semibold text-[#000000]">
          {schoolYear?.name ?? "No Active School Year"}
        </h2>
      </div>
    </header>
  );
}