import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth",
  },
});

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
  ],
};
