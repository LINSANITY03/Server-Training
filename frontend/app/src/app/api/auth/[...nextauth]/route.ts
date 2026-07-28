// src/lib/auth.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { JWT } from "next-auth/jwt";

const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";

/**
 * Define the custom shape of Django SimpleJWT payload
*/ 
interface DjangoJwtPayload extends JwtPayload {
  user_id: string;
  name: string;
  email: string;
  token_type: string;
}

type DjangoRefreshResponse = {
  access: string;
  refresh?: string;
};

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${DJANGO_API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken }),
    });

    const refreshedTokens: DjangoRefreshResponse = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access,
      // Fall back to old refresh token if Django doesn't rotate it
      refreshToken: refreshedTokens.refresh ?? token.refreshToken, 
      accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 Minutes from now
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError", // Client-side check can force a re-login
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Pass credentials to Django SimpleJWT endpoint
        const res = await fetch(`${DJANGO_API_URL}/api/token/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await res.json();
        if (res.ok && data) {
          const decoded_user = jwtDecode<DjangoJwtPayload>(data.access)
          return {
            id: decoded_user.user_id,
            email: decoded_user.email,
            accessToken: data.access,
            refreshToken: data.refresh,
            // Convert the JWT Unix 'exp' timestamp (seconds) to JS milliseconds
            accessTokenExpires: decoded_user.exp? decoded_user.exp * 1000 : Date.now() + 15 * 60 * 1000,
          };
        }
        
        // Login failed
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // 2. REFRESH & PERSIST: Manage tokens inside NextAuth encrypted JWT cookie
    async jwt({ token, user }) {
      // If 'user' object is present, this is the initial sign-in
      if (user) {
        return {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          user: { id: user.id, email: user.email! },
        };
      }

      // If the access token hasn't expired yet, return it untouched
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // If token expired, trigger Django refresh flow
      return refreshAccessToken(token);
    },

    // Expose tokens safely to NextAuth Client-side hooks
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      session.error = token.error;
      return session;
    },
  },
};

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };