import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
  pages: {
    signIn: "/auth",
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/trips/:path*", "/expenses/:path*"],
};
