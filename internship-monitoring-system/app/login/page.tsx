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



  async function handleLogin(e: React.FormEvent){

    e.preventDefault();

    setError("");



    const {
        error
        } = await supabase.auth.signInWithPassword({
        email,
        password,
        });

   if(error){

        setError(error.message);

        return;

    }
        const {
        data: {
            session
        }
        } = await supabase.auth.getSession();


        if(!session){

        setError("Session was not created");

        return;

        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const role = profile?.role ?? "coordinator";

        router.refresh();

        router.push(
          role === "admin" ? "/admin/dashboard" : "/coordinator/dashboard"
        );

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
          className="rounded bg-black p-2 text-white"
        >
          Login
        </button>


      </form>

    </div>

  );

}
