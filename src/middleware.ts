import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const middleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Redirect home page based on auth status
    if (pathname === "/") {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }

    // Check role-based access for protected routes
    if (token?.role === "SUPPLIER") {
      // Suppliers: only access orders to prepare
      if (pathname.startsWith("/dashboard/settings")) {
        return NextResponse.redirect(new URL("/dashboard/orders", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow home page and auth routes without authentication
        if (req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/auth")) {
          return true;
        }
        // Require token for other routes
        return !!token;
      },
    },
  }
);

// Protect dashboard routes and handle home page
export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
