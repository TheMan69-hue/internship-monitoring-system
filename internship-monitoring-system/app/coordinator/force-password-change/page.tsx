"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { activateCoordinator } from "@/lib/actions/auth-actions";

export default function ForcePasswordChangePage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await activateCoordinator(password);

      if (result.success) {
        setSuccess(true);
        // Short delay, then redirect to dashboard
        setTimeout(() => {
          router.refresh();
          router.push("/coordinator/dashboard");
        }, 1500);
      } else {
        setError(result.message ?? "Failed to update password.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center py-20">
      <div className="flex w-96 flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-green-700">Password Updated</h1>
          <p className="text-gray-600">
            Your account has been activated. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <form
        onSubmit={handleSubmit}
        className="flex w-96 flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold">Set Your Password</h1>
        <p className="text-sm text-gray-600">
          This is your first login. Please set a new password to activate your
          account.
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="password"
          placeholder="New password (min 8 characters)"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          className="rounded border p-2"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          className="rounded border p-2"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black p-2 text-white disabled:opacity-50"
        >
          {loading ? "Updating..." : "Set Password & Activate"}
        </button>
      </form>
    </div>
  );
}
