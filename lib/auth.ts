import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

// Define a custom user type that includes the role and email verification
interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  password: string | null;
  role: string;
  emailVerified: Date | null;
}

// Declare module augmentations for TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      sessionUpdatedAt?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    role?: string | null;
    emailVerified?: Date | null;
    sessionUpdateCount?: number;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email address before signing in. Check your email for a verification link.");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days (increased from 14 days)
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      // name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: process.env.NODE_ENV === "production" ? "renograte.com" : undefined,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        // Always update session with token data (which doesn't require a DB hit)
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role;
        
        // Only check the database for updates every 5 minutes (or when forced)
        // or if sessionUpdateCount is not set (first time)
        const shouldRefreshFromDB = !token.sessionUpdateCount || 
          (Date.now() - (session.user.sessionUpdatedAt || 0) > 5 * 60 * 1000); // 5 minutes
        
        if (shouldRefreshFromDB) {
          try {
            const user = await prisma.user.findUnique({
              where: { id: token.id },
              select: { 
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                emailVerified: true
              }
            });
            
            if (user) {
              // Update session with fresh data from database
              session.user.name = user.name;
              session.user.email = user.email;
              session.user.image = user.image;
              session.user.role = user.role;
              session.user.sessionUpdatedAt = Date.now();
              
              // Update token for future use
              token.name = user.name;
              token.email = user.email;
              token.picture = user.image;
              token.role = user.role;
              token.emailVerified = user.emailVerified;
              token.sessionUpdateCount = (token.sessionUpdateCount || 0) + 1;
            }
          } catch (error) {
            console.error("Error refreshing session from database:", error);
            // Continue with token data if DB refresh fails
          }
        }
      }
      return session;
    },
    async jwt({ token, user, trigger }: { token: JWT; user: any; trigger?: string }) {
      // When signing in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
        token.sessionUpdateCount = 0;
      }
      
      // Force refresh when the session is explicitly updated
      if (trigger === 'update') {
        token.sessionUpdateCount = 0; // Reset count to force DB refresh
      }
      
      return token;
    }
  },
  debug: process.env.NODE_ENV === "development",
}; 