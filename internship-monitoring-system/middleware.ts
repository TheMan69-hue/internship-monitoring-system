import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const adminRoutes = ["/admin"];
const coordinatorRoutes = ["/coordinator"];
const protectedRoutes = [...adminRoutes, ...coordinatorRoutes];

function isOnProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

function isOnAdminRoute(pathname: string) {
  return adminRoutes.some((route) => pathname.startsWith(route));
}

function isOnCoordinatorRoute(pathname: string) {
  return coordinatorRoutes.some((route) => pathname.startsWith(route));
}

async function getUserRole(
  supabase: ReturnType<typeof createServerClient>
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return profile?.role ?? null;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user ? await getUserRole(supabase) : null;

  if (!user && isOnProtectedRoute(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname =
      role === "admin" ? "/admin/dashboard" : "/coordinator/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  if (user && isOnAdminRoute(pathname) && role !== "admin") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/coordinator/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  if (user && isOnCoordinatorRoute(pathname) && role !== "coordinator") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  if (user && pathname === "/") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname =
      role === "admin" ? "/admin/dashboard" : "/coordinator/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
