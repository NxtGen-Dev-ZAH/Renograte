"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: any | null;
  isLoading: boolean;
  session: any | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  user: null,
  isLoading: true,
  session: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result) {
        throw new Error("Authentication failed");
      }

      if (result.error) {
        throw new Error(result.error);
      }

      // If we get here, login was successful
      return;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!session?.user, 
        login, 
        logout, 
        user: session?.user || null,
        isLoading,
        session
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 