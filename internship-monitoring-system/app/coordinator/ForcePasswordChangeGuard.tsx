"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { checkCoordinatorActive } from "@/lib/actions/auth-actions";

/**
 * FR-3.1.14–3.1.15: Client-side guard that redirects inactive coordinators
 * to the forced password-change page. Uses usePathname() for reliable path
 * detection and a server action to bypass RLS.
 */
export default function ForcePasswordChangeGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Avoid infinite redirect — skip on the force-password-change page itself
    if (pathname?.includes("/coordinator/force-password-change")) return;

    const check = async () => {
      try {
        const { active } = await checkCoordinatorActive();
        if (!active) {
          router.refresh();
          router.push("/coordinator/force-password-change");
        }
      } catch {
        // Fail silently
      }
    };

    check();
  }, [pathname, router]);

  return null;
}
