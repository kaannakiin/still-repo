import { TokenPayload } from "@repo/types";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@repo/types";

const adminRoutes = ["/api/admin", "/trpc/admin", "/admin"];
const loggedInRoutes = ["/api/user", "/dashboard", "/trpc/user", "/user"];
const authRoutes = ["/api/auth", "/trpc/auth", "/auth", "/login", "/register"];

export async function middleware(req: NextRequest) {
  const access_token = req.cookies.get("access_token")?.value || null;
  const refresh_token = req.cookies.get("refresh_token")?.value || null;
  let auth: TokenPayload | null = null;

  if (!access_token && !refresh_token) {
    auth = null;
  }

  if (access_token) {
    const authResponse = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `access_token=${access_token}`,
        "Content-Type": "application/json",
      },
    });
    if (authResponse.ok) {
      auth = (await authResponse.json()) as TokenPayload;
    } else {
      auth = null;
    }
  } else if (!auth && refresh_token) {
    const refreshResponse = await fetch(
      `${process.env.BACKEND_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          Cookie: `refresh_token=${refresh_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (refreshResponse.ok) {
      const refreshSetCookies = refreshResponse.headers.getSetCookie();
      const newResponse = NextResponse.next();

      let newAccessToken = null;
      if (refreshSetCookies) {
        refreshSetCookies.forEach((cookie) => {
          newResponse.headers.append("Set-Cookie", cookie);

          if (cookie.startsWith("access_token=")) {
            const tokenMatch = cookie.match(/access_token=([^;]+)/);
            if (tokenMatch) {
              newAccessToken = tokenMatch[1];
            }
          }
        });
      }

      if (newAccessToken) {
        const newAuthRes = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
          method: "GET",
          headers: {
            Cookie: `access_token=${newAccessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (newAuthRes.ok) {
          auth = (await newAuthRes.json()) as TokenPayload;
        } else {
          auth = null;
        }
      }

      const pathname = req.nextUrl.pathname;
      const routeCheckResult = checkRouteAccess(pathname, auth);

      if (routeCheckResult) {
        return routeCheckResult;
      }

      return newResponse;
    } else {
      auth = null;
    }
  }

  // Route kontrolü
  const pathname = req.nextUrl.pathname;
  const routeCheckResult = checkRouteAccess(pathname, auth);

  if (routeCheckResult) {
    return routeCheckResult;
  }

  return NextResponse.next();
}

function checkRouteAccess(
  pathname: string,
  auth: TokenPayload | null
): NextResponse | null {
  // Admin routes kontrolü
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdminRoute) {
    if (!auth) {
      return NextResponse.redirect(
        new URL("/login", process.env.BASE_URL || "http://localhost:3000")
      );
    }
    if (auth.role !== Role.OWNER && auth.role !== Role.ADMIN) {
      return NextResponse.redirect(
        new URL("/", process.env.BASE_URL || "http://localhost:3000")
      );
    }
  }

  // Logged in routes kontrolü
  const isLoggedInRoute = loggedInRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isLoggedInRoute) {
    if (!auth) {
      // Giriş yapmamış kullanıcıyı login'e yönlendir
      return NextResponse.redirect(
        new URL("/login", process.env.BASE_URL || "http://localhost:3000")
      );
    }
  }

  // Auth routes kontrolü (giriş yapmış kullanıcılar erişemez)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute) {
    if (auth) {
      // Giriş yapmış kullanıcıyı dashboard'a yönlendir
      return NextResponse.redirect(
        new URL("/", process.env.BASE_URL || "http://localhost:3000")
      );
    }
  }

  return null; // Herhangi bir redirect gerekmiyor
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
