import { compare } from "bcryptjs";
import { z } from "zod";
import type { Role } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import {
  clearRateLimitKey,
  incrementRateLimit,
  peekRateLimit,
} from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const ADMIN_LOGIN_FAIL_LIMIT = 6;
const ADMIN_LOGIN_FAIL_WINDOW_MS = 15 * 60 * 1000;

function getHeaderValue(
  headers: Headers | Record<string, string | string[] | undefined>,
  key: string
) {
  if (headers instanceof Headers) {
    return headers.get(key);
  }

  const value = headers[key] ?? headers[key.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value || null;
}

function getIpFromAuthorizeRequest(req: unknown): string {
  if (!req || typeof req !== "object") {
    return "anonymous";
  }

  const maybeHeaders = (req as { headers?: Headers | Record<string, string | string[] | undefined> }).headers;
  if (!maybeHeaders) {
    return "anonymous";
  }

  const forwardedFor = getHeaderValue(maybeHeaders, "x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "anonymous";
  }

  return (
    getHeaderValue(maybeHeaders, "x-real-ip") ||
    getHeaderValue(maybeHeaders, "cf-connecting-ip") ||
    "anonymous"
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const ip = getIpFromAuthorizeRequest(req);
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            role: true,
            passwordHash: true,
          },
        });

        const isAdminRole = user?.role === "admin" || user?.role === "staff";
        const adminRateLimitKey = `auth:admin-login-fail:${ip}`;

        if (isAdminRole) {
          const lockout = await peekRateLimit({
            key: adminRateLimitKey,
            limit: ADMIN_LOGIN_FAIL_LIMIT,
            windowMs: ADMIN_LOGIN_FAIL_WINDOW_MS,
          });
          if (!lockout.allowed) {
            return null;
          }
        }

        if (!user?.passwordHash) {
          if (isAdminRole) {
            await incrementRateLimit({
              key: adminRateLimitKey,
              limit: ADMIN_LOGIN_FAIL_LIMIT,
              windowMs: ADMIN_LOGIN_FAIL_WINDOW_MS,
            });
          }
          return null;
        }

        const validPassword = await compare(parsed.data.password, user.passwordHash);
        if (!validPassword) {
          if (isAdminRole) {
            await incrementRateLimit({
              key: adminRateLimitKey,
              limit: ADMIN_LOGIN_FAIL_LIMIT,
              windowMs: ADMIN_LOGIN_FAIL_WINDOW_MS,
            });
          }
          return null;
        }

        if (isAdminRole) {
          await clearRateLimitKey(adminRateLimitKey);
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.userId || !token.role) {
        return session;
      }

      session.user.id = token.userId;
      session.user.role = token.role as Role;
      return session;
    },
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getAuthSession();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "staff")) {
    return null;
  }
  return session;
}
