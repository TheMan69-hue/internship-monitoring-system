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
        data,
        error
        } = await supabase.auth.signInWithPassword({
        email,
        password,
        });

        console.log("LOGIN RESULT:", data);



   if(error){

        setError(error.message);

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


        if(!session){

        setError("Session was not created");

        return;

        }


        // Refresh Next.js server so it receives the auth cookie

        router.refresh();


        router.push("/coordinator/dashboard");

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