export const publicRoutes: string[] = [
  // Routes which will be publicly available
];

export const protectedRoutes: string[] = [
  // Routes which will NOT be publicly available
];

export const authRoutes: string[] = [
  // Made Accessible publicly only before login
  "/auth/sign-in",
];

export const apiAuthPrefix: string = "/api/auth"; //Routes which donot require authentication

export const DEFAULT_LOGIN_REDIRECT = "/"; // Redirecting to home page
