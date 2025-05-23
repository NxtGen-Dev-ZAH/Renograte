import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Define a custom user type that includes the role
interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  password: string | null;
  role: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        }) as User | null;

        // If no user found, or password doesn't match, return null
        if (!user || !user.password) {
          return null;
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Return user without password
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user id and role to session
      if (token.sub && session.user) {
        session.user.id = token.sub;
        
        // Fetch the latest user data to ensure we have up-to-date role information
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        });
        
        // Use the latest role from the database, fallback to token if not found
        if (user) {
          (session.user as any).role = user.role;
        } else if (token.role) {
          (session.user as any).role = token.role;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add user id and role to token
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 