import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

// Dynamically determine the base URL for both dev and production
function getBaseUrl() {
  // In production (Vercel), use the VERCEL_URL or custom domain
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // For other production environments, check for custom domain
  if (process.env.NODE_ENV === "production" && process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }

  // Development fallback
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: getBaseUrl(),
});

export type Session = typeof auth.$Infer.Session;
