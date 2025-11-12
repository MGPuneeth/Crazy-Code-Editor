import NextAuth from "next-auth";
import authConfig from "./auth.config";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  publicRoutes,
  authRoutes,
  protectedRoutes,
} from "@/routes";
import { request } from "http";

// import { URL } from "next/dist/compiled/@edge-runtime/primitives/url";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  console.log("✅ Proxy running for:", req.url);

  const { nextUrl } = req;
  const isLoggedin = !!req.auth;
  // const nextUrl = new URL(req.url);

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedin) {
      console.log("Logged in");

      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedin && !isPublicRoute) {
    console.log("Not Logged in");
    return Response.redirect(new URL("/auth/sign-in", nextUrl));
  }
  return null;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
