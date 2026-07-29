"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";


export default function LoginPage() {

  const supabase = createClient();

  const router = useRouter();


  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const [error,setError] = useState("");
  const [loading, setLoading] = useState(false);



  async function handleLogin(e: React.FormEvent){

    e.preventDefault();

    setError("");
    setLoading(true);



    const {
        data,
        error
        } = await supabase.auth.signInWithPassword({
        email,
        password,
        });

        console.log("LOGIN RESULT:", data);



   if(error){

        if (error.message === "Invalid login credentials") {
          setError("Incorrect email or password.");
        } else {
          setError("Unable to sign in. Please try again.");
        }

        return;

    }
        const sessionCheck = await supabase.auth.getSession();

        console.log("SESSION CHECK:", sessionCheck.data.session);


        const {
        data: {
            session
        }
        } = await supabase.auth.getSession();


        console.log("SESSION:", session);


        if (!session) {

          setError("Session was not created.");

          setLoading(false);

          return;

      }


        // Get user's profile
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (profileError || !profile) {
            setError("Profile not found.");
            setLoading(false);
            return;
        }

        router.refresh();

        if (profile.role === "admin") {
          router.push("/admin/dashboard");
        } else if (profile.role === "coordinator") {
          router.push("/coordinator/dashboard");
        } else {
            setError("This login is only for administrators and coordinators.");
            setLoading(false);
        }

  }



  return (

    <div className="flex min-h-screen items-center justify-center">

      <form
        onSubmit={handleLogin}
        className="flex w-96 flex-col gap-4 rounded-lg border p-6"
      >

        <h1 className="text-2xl font-bold">
          SIMMS Login
        </h1>


        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="rounded border p-2"
        />


        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="rounded border p-2"
        />


        {
          error &&
          <p className="text-red-500">
            {error}
          </p>
        }


        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>


      </form>

    </div>

  );

}