import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isApiRoute = req.nextUrl.pathname.startsWith("/api/admin");
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    if ((isAdminRoute || isApiRoute) && token?.role !== "ADMIN") {
      if (isApiRoute) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden. Admin access required." }),
          { status: 403, headers: { "content-type": "application/json" } }
        );
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    pages: {
      signIn: "/auth",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/trips/:path*",
    "/expenses/:path*",
    "/budget/:path*",
    "/currency/:path*",
    "/wishlist/:path*",
    "/gallery/:path*",
    "/stories/:path*",
    "/profile/:path*",
    "/explore/:path*",
    "/guides/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};

