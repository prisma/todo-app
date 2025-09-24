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
  trustedOrigins: process.env.VERCEL
    ? (request) => {
        // In Vercel, dynamically allow deployment URLs
        const origin = request.headers.get("origin") || "";
        const defaultOrigins = [
          "http://localhost:3000",
          // Current deployment URL
          ...(process.env.VERCEL_URL
            ? [`https://${process.env.VERCEL_URL}`]
            : []),
          // Branch URL for preview deployments
          ...(process.env.VERCEL_BRANCH_URL
            ? [`https://${process.env.VERCEL_BRANCH_URL}`]
            : []),
          // Production URL
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
            : []),
          // Custom trusted origins
          ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
            ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((origin) =>
                origin.trim()
              )
            : []),
        ];

        // Allow any Vercel deployment URL for this project (*.vercel.app)
        const isVercelUrl = origin.includes(".vercel.app");

        return [...defaultOrigins, ...(isVercelUrl ? [origin] : [])];
      }
    : [
        "http://localhost:3000",
        ...(process.env.VERCEL_URL
          ? [`https://${process.env.VERCEL_URL}`]
          : []),
        ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
          ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((origin) =>
              origin.trim()
            )
          : []),
      ],
});

export type Session = typeof auth.$Infer.Session;
